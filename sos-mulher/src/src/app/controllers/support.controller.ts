import { Injectable, signal } from "@angular/core"
import { SupportRequest } from "../models/app.models"
import { MockDatabaseService } from "../services/mock-database.service"

@Injectable({ providedIn: "root" })
export class SupportController {
  readonly request = signal<SupportRequest>({
    protocol: "AP-2026-0184",
    status: "idle",
  })

  constructor(private readonly database: MockDatabaseService) {}

  requestSupport(): void {
    if (this.request().status === "assigned") return
    this.request.set({ protocol: "AP-2026-0184", status: "searching" })
    window.setTimeout(() => {
      this.request.set({
        protocol: "AP-2026-0184",
        status: "assigned",
        assignedTeamId: "bravo",
        estimatedArrivalMinutes: 4,
        distanceKm: 1.8,
      })
      this.database.updateTeam("bravo", { status: "en-route" })
    }, 2200)
  }
}
