import { computed, Injectable } from "@angular/core"
import { AuthController } from "./auth.controller"
import { MockDatabaseService } from "../services/mock-database.service"
import { GeolocationService } from "../services/geolocation.service"
import { Occurrence, OccurrenceStatus } from "../models/app.models"

@Injectable({ providedIn: "root" })
export class OccurrenceController {
  readonly occurrences = this.database.occurrences
  readonly currentVictimOccurrence = computed(() => {
    const user = this.auth.currentUser()
    if (!user) return
    return this.occurrences().find(
      (item) => item.victimUserId === user.id && item.status !== "finished",
    ) ?? this.occurrences().find((item) => item.victimUserId === user.id)
  })

  constructor(
    private readonly database: MockDatabaseService,
    private readonly auth: AuthController,
    private readonly geolocation: GeolocationService,
  ) {}

  byStatus(status: OccurrenceStatus): Occurrence[] {
    return this.occurrences().filter((item) => item.status === status)
  }

  async requestHelp(): Promise<Occurrence | undefined> {
    const user = this.auth.currentUser()
    if (!user || user.role !== "victim") return
    const location = await this.geolocation.getCurrentPosition()
    const occurrence: Occurrence = {
      id: crypto.randomUUID(),
      victimUserId: user.id,
      status: "open",
      createdAt: new Date(),
      latitude: location.latitude,
      longitude: location.longitude,
    }
    this.database.saveOccurrence(occurrence)
    return occurrence
  }

  accept(id: string): void {
    this.database.updateOccurrence(id, {
      status: "accepted",
      assignedTeamId: "alpha",
      acceptedAt: new Date(),
    })
    this.database.updateTeam("alpha", { status: "en-route" })
  }

  finish(id: string): void {
    this.database.updateOccurrence(id, {
      status: "finished",
      finishedAt: new Date(),
    })
    this.database.updateTeam("alpha", { status: "available" })
  }
}
