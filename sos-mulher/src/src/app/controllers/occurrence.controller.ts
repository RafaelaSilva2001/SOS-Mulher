import { computed, Injectable } from "@angular/core"
import { AuthController } from "./auth.controller"
import { GeolocationService } from "../services/geolocation.service"
import { ApiService } from "../services/api.service"
import { AppDataService } from "../services/app-data.service"
import { Occurrence, OccurrenceStatus } from "../models/app.models"

@Injectable({ providedIn: "root" })
export class OccurrenceController {
  readonly occurrences = this.data.occurrences
  readonly currentVictimOccurrence = computed(() => {
    const user = this.auth.currentUser()
    if (!user) return
    return this.occurrences().find(
      (item) => item.victimUserId === user.id && item.status !== "finished",
    ) ?? this.occurrences().find((item) => item.victimUserId === user.id)
  })

  constructor(
    private readonly api: ApiService,
    private readonly data: AppDataService,
    private readonly auth: AuthController,
    private readonly geolocation: GeolocationService,
  ) {}

  load(): Promise<void> {
    return this.data.loadOccurrences()
  }

  byStatus(status: OccurrenceStatus): Occurrence[] {
    return this.occurrences().filter((item) => item.status === status)
  }

  async requestHelp(): Promise<Occurrence | undefined> {
    const user = this.auth.currentUser()
    if (!user || user.role !== "victim") return
    const location = await this.geolocation.getCurrentPosition()
    const occurrence = await this.api.createOccurrence(location.latitude, location.longitude)
    this.data.upsertOccurrence(occurrence)
    return occurrence
  }

  async accept(id: string): Promise<void> {
    this.data.upsertOccurrence(await this.api.acceptOccurrence(id))
    await this.data.loadTeams()
  }

  async finish(id: string): Promise<void> {
    this.data.upsertOccurrence(await this.api.finishOccurrence(id))
    await this.data.loadTeams()
  }
}
