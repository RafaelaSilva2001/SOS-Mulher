import type { Request, Response, NextFunction } from "express"

export type UserRole = "victim" | "agent"
export type OccurrenceStatus = "open" | "accepted" | "finished"
export type TeamStatus = "available" | "en-route" | "in-service"

export interface AuthUser {
  id: string
  role: UserRole
  name: string
  cpf: string
  phone: string
  photo?: string
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser
    }
  }
}

export type AsyncRoute = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void | Promise<void>
