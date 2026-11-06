import { randomBytes } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { database } from "./database.js"
import type { AuthUser, UserRole } from "./types.js"

const configuredSecret = process.env.JWT_SECRET
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("JWT_SECRET must contain at least 32 characters in production.")
}

function getJwtSecret(): string {
  if (configuredSecret) return configuredSecret
  const secretPath = resolve(process.cwd(), "data", ".jwt-secret")
  mkdirSync(resolve(secretPath, ".."), { recursive: true })
  if (existsSync(secretPath)) return readFileSync(secretPath, "utf8").trim()
  const secret = randomBytes(32).toString("hex")
  try {
    writeFileSync(secretPath, secret, { encoding: "utf8", flag: "wx", mode: 0o600 })
    return secret
  } catch (error) {
    if (existsSync(secretPath)) return readFileSync(secretPath, "utf8").trim()
    throw error
  }
}

const jwtSecret = getJwtSecret()

export function issueToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: "8h" })
}

export function requireAuth(request: Request, response: Response, next: NextFunction): void {
  const authorization = request.header("authorization")
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined
  if (!token) {
    response.status(401).json({ error: "Autenticação necessária." })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      response.status(401).json({ error: "Sessão inválida." })
      return
    }
    const row = database.prepare(`
      SELECT id, role, name, cpf, phone, photo FROM users WHERE id = ?
    `).get(payload.sub) as AuthUser | undefined
    if (!row) {
      response.status(401).json({ error: "Sessão inválida." })
      return
    }
    request.authUser = row
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({ error: "Sessão inválida ou expirada." })
      return
    }
    next(error)
  }
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (!request.authUser || !roles.includes(request.authUser.role)) {
      response.status(403).json({ error: "Acesso não autorizado." })
      return
    }
    next()
  }
}
