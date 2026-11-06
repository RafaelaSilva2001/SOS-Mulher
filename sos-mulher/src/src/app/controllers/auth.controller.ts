import { computed, Injectable, signal } from "@angular/core"
import { User, UserRole, VictimProfile } from "../models/app.models"
import { MockDatabaseService } from "../services/mock-database.service"
import { formatCpf } from "../utils/masks"

@Injectable({ providedIn: "root" })
export class AuthController {
  readonly currentUser = signal<User | null>(null)
  readonly isVictim = computed(() => this.currentUser()?.role === "victim")
  readonly victimProfile = computed<VictimProfile | undefined>(() => {
    const user = this.currentUser()
    return user?.role === "victim"
      ? this.database.getVictimProfile(user.id)
      : undefined
  })

  constructor(private readonly database: MockDatabaseService) {}

  login(role: UserRole, cpf: string, password: string): boolean {
    const user = this.database.findUser(role, formatCpf(cpf), password)
    if (!user) return false
    this.currentUser.set(user)
    return true
  }

  logout(): void {
    this.currentUser.set(null)
  }

  updateVictim(userChanges: Partial<User>, profileChanges: Partial<VictimProfile>): void {
    const user = this.currentUser()
    if (!user) return
    this.database.updateUser(user.id, userChanges)
    this.database.updateVictimProfile(user.id, profileChanges)
    this.currentUser.set(this.database.getUser(user.id) ?? null)
  }

  registerVictim(user: User, profile: VictimProfile): void {
    this.database.addVictim(user, profile)
    this.currentUser.set(user)
  }
}
