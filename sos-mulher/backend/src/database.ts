import { randomUUID } from "node:crypto"
import { mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import Database from "better-sqlite3"
import bcrypt from "bcryptjs"

const databasePath = resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? "./data/sos-mulher.sqlite",
)

mkdirSync(dirname(databasePath), { recursive: true })

export const database = new Database(databasePath)
database.pragma("journal_mode = WAL")
database.pragma("foreign_keys = ON")
database.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    members TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'en-route', 'in-service')),
    base TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('victim', 'agent')),
    name TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo TEXT
  );
  CREATE TABLE IF NOT EXISTS victim_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL DEFAULT '',
    district TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT 'Recife',
    state TEXT NOT NULL DEFAULT 'PE',
    emergency_contact_name TEXT NOT NULL DEFAULT '',
    emergency_contact_phone TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    registration TEXT NOT NULL,
    team_id TEXT NOT NULL REFERENCES teams(id)
  );
  CREATE TABLE IF NOT EXISTS occurrences (
    id TEXT PRIMARY KEY,
    victim_user_id TEXT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'finished')),
    created_at TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    assigned_team_id TEXT REFERENCES teams(id),
    accepted_at TEXT,
    finished_at TEXT
  );
  CREATE INDEX IF NOT EXISTS occurrences_status_created
    ON occurrences(status, created_at);
  CREATE TABLE IF NOT EXISTS support_requests (
    id TEXT PRIMARY KEY,
    protocol TEXT NOT NULL UNIQUE,
    agent_user_id TEXT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL CHECK (status IN ('searching', 'assigned')),
    assigned_team_id TEXT REFERENCES teams(id),
    estimated_arrival_minutes INTEGER,
    distance_km REAL,
    created_at TEXT NOT NULL
  );
`)

const seedTeams = [
  { id: "alpha", name: "Equipe Alfa", members: ["Agente Lima", "Agente Souza"], status: "available", base: "Central Recife" },
  { id: "bravo", name: "Equipe Bravo", members: ["Agente Ribeiro", "Agente Costa"], status: "available", base: "Setor Sul" },
  { id: "charlie", name: "Equipe Charlie", members: ["Agente Oliveira", "Agente Melo"], status: "in-service", base: "Setor Centro" },
  { id: "delta", name: "Equipe Delta", members: ["Agente Nunes", "Agente Barbosa"], status: "available", base: "Setor Norte" },
] as const

const insertTeam = database.prepare(`
  INSERT OR IGNORE INTO teams (id, name, members, status, base)
  VALUES (@id, @name, @members, @status, @base)
`)

for (const team of seedTeams) {
  insertTeam.run({ ...team, members: JSON.stringify(team.members) })
}

if (process.env.NODE_ENV !== "production" && !database.prepare("SELECT 1 FROM users LIMIT 1").get()) {
  const insertUser = database.prepare(`
    INSERT INTO users (id, role, name, cpf, password_hash, phone, photo)
    VALUES (@id, @role, @name, @cpf, @passwordHash, @phone, @photo)
  `)
  const insertProfile = database.prepare(`
    INSERT INTO victim_profiles
      (id, user_id, address, district, city, state, emergency_contact_name, emergency_contact_phone)
    VALUES (@id, @userId, @address, @district, 'Recife', 'PE', @emergencyContactName, @emergencyContactPhone)
  `)

  const demoVictimId = randomUUID()
  insertUser.run({
    id: demoVictimId,
    role: "victim",
    name: "Mariana Alves (teste)",
    cpf: "12345678900",
    passwordHash: bcrypt.hashSync("12345678", 12),
    phone: "(81) 99942-7810",
    photo: null,
  })
  insertProfile.run({
    id: randomUUID(),
    userId: demoVictimId,
    address: "Rua de demonstração, 100",
    district: "Boa Vista",
    emergencyContactName: "Contato de teste",
    emergencyContactPhone: "(81) 99999-0000",
  })

  const demoAgentId = randomUUID()
  insertUser.run({
    id: demoAgentId,
    role: "agent",
    name: "Agente Lima (teste)",
    cpf: "98765432100",
    passwordHash: bcrypt.hashSync("12345678", 12),
    phone: "(81) 98810-1001",
    photo: null,
  })
  database.prepare(`
    INSERT INTO agents (id, user_id, registration, team_id)
    VALUES (?, ?, ?, ?)
  `).run(randomUUID(), demoAgentId, "1247", "alpha")
}
