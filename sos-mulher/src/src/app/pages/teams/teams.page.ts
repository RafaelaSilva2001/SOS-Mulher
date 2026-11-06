import { Component, computed } from "@angular/core"
import { Router } from "@angular/router"
import { SupportController } from "../../controllers/support.controller"
import { MockDatabaseService } from "../../services/mock-database.service"

@Component({
  standalone: false,
  templateUrl: "./teams.page.html",
})
export class TeamsPage {
  readonly available = computed(
    () => this.database.teams().filter((team) => team.status === "available").length,
  )
  readonly inService = computed(
    () => this.database.teams().filter((team) => team.status === "in-service").length,
  )
  readonly enRoute = computed(
    () => this.database.teams().filter((team) => team.status === "en-route").length,
  )

  constructor(
    readonly database: MockDatabaseService,
    readonly support: SupportController,
    private readonly router: Router,
  ) {}

  requestSupport(): void {
    this.support.requestSupport()
    void this.router.navigateByUrl("/agente/apoio")
  }

  initials(name: string): string {
    return name.replace("Agente ", "").slice(0, 2).toUpperCase()
  }

  teamLabel(status: string): string {
    if (status === "en-route") return "Em deslocamento"
    if (status === "in-service") return "Em atendimento"
    return "Disponível"
  }
}
