import "dotenv/config"
import { randomUUID } from "node:crypto"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { database } from "./database.js"
import { issueToken, requireAuth, requireRole } from "./auth.js"
import type { AuthUser, OccurrenceStatus, TeamStatus } from "./types.js"

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.disable("x-powered-by")
app.use(helmet())
app.use(express.json({ limit: "7mb" }))

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const idSchema = z.string().uuid()
const cpfSchema = z.string().transform((value) => value.replace(/\D/g, "")).refine((value) => value.length === 11, "CPF inválido.")
const phoneSchema = z.string().min(8).max(30)
const photoSchema = z.string().max(7_000_000).nullable().optional()

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  cpf: cpfSchema,
  phone: phoneSchema,
  password: z.string().min(8).max(128),
  photo: photoSchema,
  address: z.string().trim().max(200).default(""),
  district: z.string().trim().max(100).default(""),
  emergencyContactName: z.string().trim().max(120).default(""),
  emergencyContactPhone: z.string().max(30).default(""),
  accepted: z.literal(true),
})

const loginSchema = z.object({
  role: z.enum(["victim", "agent"]),
  cpf: cpfSchema,
  password: z.string().min(1).max(128),
})

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: phoneSchema.optional(),
  photo: photoSchema,
  address: z.string().trim().max(200).optional(),
  district: z.string().trim().max(100).optional(),
  emergencyContactName: z.string().trim().max(120).optional(),
  emergencyContactPhone: z.string().max(30).optional(),
}).refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo.")

const coordinateSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
})

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? "Dados inválidos.")
  }
  return result.data
}

function userById(id: string): AuthUser | undefined {
  return database.prepare(`
    SELECT id, role, name, cpf, phone, photo FROM users WHERE id = ?
  `).get(id) as AuthUser | undefined
}

function victimProfileByUserId(userId: string) {
  return database.prepare(`
    SELECT id, user_id AS userId, address, district, city, state,
      emergency_contact_name AS emergencyContactName,
      emergency_contact_phone AS emergencyContactPhone
    FROM victim_profiles WHERE user_id = ?
  `).get(userId)
}

function sessionResponse(user: AuthUser) {
  return {
    token: issueToken(user),
    user,
    profile: user.role === "victim" ? victimProfileByUserId(user.id) : null,
  }
}

function occurrenceById(id: string, includeVictim: boolean) {
  const occurrence = database.prepare(`
    SELECT id, victim_user_id AS victimUserId, status, created_at AS createdAt,
      latitude, longitude, assigned_team_id AS assignedTeamId,
      accepted_at AS acceptedAt, finished_at AS finishedAt
    FROM occurrences WHERE id = ?
  `).get(id) as {
    id: string
    victimUserId: string
    status: OccurrenceStatus
    createdAt: string
    latitude: number
    longitude: number
    assignedTeamId?: string
    acceptedAt?: string
    finishedAt?: string
  } | undefined
  if (!occurrence || !includeVictim) return occurrence
  return {
    ...occurrence,
    victim: userById(occurrence.victimUserId),
    profile: victimProfileByUserId(occurrence.victimUserId),
  }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
})

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" })
})

app.post("/api/auth/register", authLimiter, (request, response) => {
  const input = parse(registrationSchema, request.body)
  const userId = randomUUID()
  const profileId = randomUUID()
  const createAccount = database.transaction(() => {
    database.prepare(`
      INSERT INTO users (id, role, name, cpf, password_hash, phone, photo)
      VALUES (?, 'victim', ?, ?, ?, ?, ?)
    `).run(userId, input.name, input.cpf, bcrypt.hashSync(input.password, 12), input.phone, input.photo ?? null)
    database.prepare(`
      INSERT INTO victim_profiles
        (id, user_id, address, district, city, state, emergency_contact_name, emergency_contact_phone)
      VALUES (?, ?, ?, ?, 'Recife', 'PE', ?, ?)
    `).run(profileId, userId, input.address, input.district, input.emergencyContactName, input.emergencyContactPhone)
  })
  try {
    createAccount()
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: users.cpf")) {
      throw new HttpError(409, "Já existe uma conta cadastrada com este CPF.")
    }
    throw error
  }
  const user = userById(userId)
  if (!user) throw new Error("A conta foi criada, mas não pôde ser carregada.")
  response.status(201).json(sessionResponse(user))
})

app.post("/api/auth/login", authLimiter, (request, response) => {
  const input = parse(loginSchema, request.body)
  const row = database.prepare(`
    SELECT id, role, name, cpf, phone, photo, password_hash AS passwordHash
    FROM users WHERE cpf = ? AND role = ?
  `).get(input.cpf, input.role) as (AuthUser & { passwordHash: string }) | undefined
  if (!row || !bcrypt.compareSync(input.password, row.passwordHash)) {
    throw new HttpError(401, "CPF ou senha inválidos.")
  }
  const { passwordHash: _passwordHash, ...user } = row
  response.json(sessionResponse(user))
})

app.get("/api/auth/me", requireAuth, (request, response) => {
  const user = request.authUser!
  response.json({
    user,
    profile: user.role === "victim" ? victimProfileByUserId(user.id) : null,
  })
})

app.patch("/api/profile", requireAuth, requireRole("victim"), (request, response) => {
  const input = parse(profileSchema, request.body)
  const user = request.authUser!
  const update = database.transaction(() => {
    const userFields = ["name", "phone", "photo"] as const
    const profileFields = {
      address: "address",
      district: "district",
      emergencyContactName: "emergency_contact_name",
      emergencyContactPhone: "emergency_contact_phone",
    } as const
    for (const field of userFields) {
      if (field in input) {
        database.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(input[field] ?? null, user.id)
      }
    }
    for (const [field, column] of Object.entries(profileFields)) {
      if (field in input) {
        database.prepare(`UPDATE victim_profiles SET ${column} = ? WHERE user_id = ?`)
          .run(input[field as keyof typeof profileFields], user.id)
      }
    }
  })
  update()
  response.json({ user: userById(user.id), profile: victimProfileByUserId(user.id) })
})

app.get("/api/teams", requireAuth, requireRole("agent"), (_request, response) => {
  const rows = database.prepare(`
    SELECT id, name, members, status, base FROM teams ORDER BY name
  `).all() as { id: string; name: string; members: string; status: TeamStatus; base: string }[]
  response.json(rows.map((team) => ({ ...team, members: JSON.parse(team.members) as string[] })))
})

app.get("/api/occurrences", requireAuth, (request, response) => {
  const user = request.authUser!
  const rows = user.role === "agent"
    ? database.prepare("SELECT id FROM occurrences ORDER BY created_at DESC").all() as { id: string }[]
    : database.prepare("SELECT id FROM occurrences WHERE victim_user_id = ? ORDER BY created_at DESC")
      .all(user.id) as { id: string }[]
  response.json(rows.map(({ id }) => occurrenceById(id, user.role === "agent")))
})

app.post("/api/occurrences", requireAuth, requireRole("victim"), (request, response) => {
  const { latitude, longitude } = parse(coordinateSchema, request.body)
  const user = request.authUser!
  const active = database.prepare(`
    SELECT id FROM occurrences
    WHERE victim_user_id = ? AND status != 'finished'
    LIMIT 1
  `).get(user.id) as { id: string } | undefined
  if (active) throw new HttpError(409, "Você já tem um chamado ativo.")

  const id = randomUUID()
  database.prepare(`
    INSERT INTO occurrences (id, victim_user_id, status, created_at, latitude, longitude)
    VALUES (?, ?, 'open', ?, ?, ?)
  `).run(id, user.id, new Date().toISOString(), latitude, longitude)
  response.status(201).json(occurrenceById(id, false))
})

app.patch("/api/occurrences/:id/accept", requireAuth, requireRole("agent"), (request, response) => {
  const id = parse(idSchema, request.params.id)
  const accept = database.transaction(() => {
    const occurrence = database.prepare("SELECT status FROM occurrences WHERE id = ?").get(id) as { status: string } | undefined
    if (!occurrence) throw new HttpError(404, "Ocorrência não encontrada.")
    if (occurrence.status !== "open") throw new HttpError(409, "A ocorrência não está mais em aberto.")
    const team = database.prepare("SELECT id FROM teams WHERE status = 'available' ORDER BY id LIMIT 1")
      .get() as { id: string } | undefined
    if (!team) throw new HttpError(409, "Não há equipes disponíveis no momento.")
    const acceptedAt = new Date().toISOString()
    database.prepare(`
      UPDATE occurrences SET status = 'accepted', assigned_team_id = ?, accepted_at = ? WHERE id = ?
    `).run(team.id, acceptedAt, id)
    database.prepare("UPDATE teams SET status = 'en-route' WHERE id = ?").run(team.id)
  })
  accept()
  response.json(occurrenceById(id, true))
})

app.patch("/api/occurrences/:id/finish", requireAuth, requireRole("agent"), (request, response) => {
  const id = parse(idSchema, request.params.id)
  const finish = database.transaction(() => {
    const occurrence = database.prepare(`
      SELECT status, assigned_team_id AS assignedTeamId FROM occurrences WHERE id = ?
    `).get(id) as { status: string; assignedTeamId?: string } | undefined
    if (!occurrence) throw new HttpError(404, "Ocorrência não encontrada.")
    if (occurrence.status !== "accepted") throw new HttpError(409, "A ocorrência não está em atendimento.")
    database.prepare(`
      UPDATE occurrences SET status = 'finished', finished_at = ? WHERE id = ?
    `).run(new Date().toISOString(), id)
    if (occurrence.assignedTeamId) {
      database.prepare("UPDATE teams SET status = 'available' WHERE id = ?").run(occurrence.assignedTeamId)
    }
  })
  finish()
  response.json(occurrenceById(id, true))
})

app.post("/api/support-requests", requireAuth, requireRole("agent"), (request, response) => {
  const agent = request.authUser!
  const active = database.prepare(`
    SELECT id, protocol, status, assigned_team_id AS assignedTeamId,
      estimated_arrival_minutes AS estimatedArrivalMinutes, distance_km AS distanceKm
    FROM support_requests WHERE agent_user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(agent.id)
  if (active) {
    response.json(active)
    return
  }
  const team = database.prepare("SELECT id FROM teams WHERE status = 'available' ORDER BY id LIMIT 1")
    .get() as { id: string } | undefined
  if (!team) throw new HttpError(409, "Não há equipes disponíveis no momento.")
  const id = randomUUID()
  const protocol = `AP-${new Date().getFullYear()}-${id.slice(0, 4).toUpperCase()}`
  database.transaction(() => {
    database.prepare(`
      INSERT INTO support_requests
        (id, protocol, agent_user_id, status, assigned_team_id, estimated_arrival_minutes, distance_km, created_at)
      VALUES (?, ?, ?, 'assigned', ?, 4, 1.8, ?)
    `).run(id, protocol, agent.id, team.id, new Date().toISOString())
    database.prepare("UPDATE teams SET status = 'en-route' WHERE id = ?").run(team.id)
  })()
  response.status(201).json({
    protocol,
    status: "assigned",
    assignedTeamId: team.id,
    estimatedArrivalMinutes: 4,
    distanceKm: 1.8,
  })
})

app.use((_request, _response, next) => next(new HttpError(404, "Rota não encontrada.")))

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message })
    return
  }
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "JSON inválido." })
    return
  }
  console.error(error)
  response.status(500).json({ error: "Erro interno do servidor." })
})

const server = app.listen(port, "127.0.0.1", () => {
  console.log(`SOS Mulher API listening on http://127.0.0.1:${port}`)
})

function shutdown(): void {
  server.close(() => {
    database.close()
    process.exit(0)
  })
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
