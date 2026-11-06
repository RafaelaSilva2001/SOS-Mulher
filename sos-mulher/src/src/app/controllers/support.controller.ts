import { Injectable, signal } from "@angular/core"
import { SupportRequest } from "../models/app.models"
import { ApiService } from "../services/api.service"
import { AppDataService } from "../services/app-data.service"

@Injectable({ providedIn: "root" })
export class SupportController {
  readonly request = signal<SupportRequest>({
    protocol: "",
    status: "idle",
  })

  constructor(
    private readonly api: ApiService,
    private readonly data: AppDataService,
  ) {}

  async requestSupport(): Promise<void> {
    if (this.request().status === "assigned") return
    this.request.set(await this.api.requestSupport())
    await this.data.loadTeams()
  }
}
