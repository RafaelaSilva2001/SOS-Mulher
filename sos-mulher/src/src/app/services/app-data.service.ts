import { Injectable, signal } from "@angular/core"
import { Occurrence, Team } from "../models/app.models"
import { ApiService } from "./api.service"

@Injectable({ providedIn: "root" })
export class AppDataService {
  readonly teams = signal<Team[]>([])
  readonly occurrences = signal<Occurrence[]>([])

  constructor(private readonly api: ApiService) {}

  async loadTeams(): Promise<void> {
    this.teams.set(await this.api.teams())
  }

  async loadOccurrences(): Promise<void> {
    this.occurrences.set(await this.api.occurrences())
  }

  upsertOccurrence(occurrence: Occurrence): void {
    this.occurrences.update((items) => [
      occurrence,
      ...items.filter((item) => item.id !== occurrence.id),
    ])
  }
}
