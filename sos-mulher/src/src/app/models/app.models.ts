export type UserRole = "victim" | "agent"
export type OccurrenceStatus = "open" | "accepted" | "finished"
export type TeamStatus = "available" | "en-route" | "in-service"
export type SupportStatus = "idle" | "searching" | "assigned"

export interface User {
  id: string
  role: UserRole
  name: string
  cpf: string
  phone: string
  photo?: string
}

export interface RegisterVictimInput {
  name: string
  cpf: string
  password: string
  phone: string
  photo?: string
  address: string
  district: string
  emergencyContactName: string
  emergencyContactPhone: string
  accepted: true
}

export interface AuthSession {
  token: string
  user: User
  profile: VictimProfile | null
}

export interface VictimProfile {
  id: string
  userId: string
  address: string
  district: string
  city: string
  state: string
  emergencyContactName: string
  emergencyContactPhone: string
}

export interface Agent {
  id: string
  userId: string
  registration: string
  teamId: string
}

export interface Team {
  id: string
  name: string
  members: string[]
  status: TeamStatus
  base: string
}

export interface Occurrence {
  id: string
  victimUserId: string
  status: OccurrenceStatus
  createdAt: string
  latitude: number
  longitude: number
  assignedTeamId?: string
  acceptedAt?: string
  finishedAt?: string
  victim?: User
  profile?: VictimProfile
}

export interface SupportRequest {
  protocol: string
  status: SupportStatus
  assignedTeamId?: string
  estimatedArrivalMinutes?: number
  distanceKm?: number
}
