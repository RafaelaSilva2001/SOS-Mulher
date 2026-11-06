import { computed, Injectable, signal } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import {
  AuthSession,
  RegisterVictimInput,
  User,
  UserRole,
  VictimProfile,
} from "../models/app.models"
import { ApiService } from "../services/api.service"
import { formatCpf } from "../utils/masks"

const TOKEN_KEY = "sos-mulher-token"
const SESSION_KEY = "sos-mulher-session"

@Injectable({ providedIn: "root" })
export class AuthController {
  private readonly storedSession = this.readSession()
  readonly currentUser = signal<User | null>(this.storedSession?.user ?? null)
  readonly isVictim = computed(() => this.currentUser()?.role === "victim")
  readonly victimProfile = signal<VictimProfile | undefined>(this.storedSession?.profile ?? undefined)

  constructor(private readonly api: ApiService) {}

  async login(role: UserRole, cpf: string, password: string): Promise<boolean> {
    try {
      this.saveSession(await this.api.login(role, formatCpf(cpf), password))
      return true
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) return false
      throw error
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_KEY)
    this.currentUser.set(null)
    this.victimProfile.set(undefined)
  }

  async updateVictim(
    userChanges: Partial<Pick<User, "name" | "phone" | "photo">>,
    profileChanges: Partial<Pick<VictimProfile, "address" | "district" | "emergencyContactName" | "emergencyContactPhone">>,
  ): Promise<void> {
    const user = this.currentUser()
    if (!user) throw new Error("Faça login novamente para atualizar seu perfil.")
    const updated = await this.api.updateProfile({ ...userChanges, ...profileChanges })
    this.currentUser.set(updated.user)
    this.victimProfile.set(updated.profile ?? undefined)
    this.persistCurrentSession()
  }

  async registerVictim(input: RegisterVictimInput): Promise<void> {
    this.saveSession(await this.api.register(input))
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.token)
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user: session.user,
      profile: session.profile,
    }))
    this.currentUser.set(session.user)
    this.victimProfile.set(session.profile ?? undefined)
  }

  private persistCurrentSession(): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      user: this.currentUser(),
      profile: this.victimProfile(),
    }))
  }

  private readSession(): { user: User; profile: VictimProfile | null } | null {
    const token = localStorage.getItem(TOKEN_KEY)
    const stored = localStorage.getItem(SESSION_KEY)
    if (!token || !stored) return null
    try {
      const session = JSON.parse(stored) as { user?: User; profile?: VictimProfile | null }
      if (session.user?.id && session.user.role) {
        return { user: session.user, profile: session.profile ?? null }
      }
    } catch (error) {
      console.error("Could not restore the saved session.", error)
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}
