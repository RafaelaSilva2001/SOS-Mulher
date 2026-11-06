import { Component, computed } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { Router } from "@angular/router"
import { SupportController } from "../../controllers/support.controller"
import { AppDataService } from "../../services/app-data.service"

@Component({
  standalone: false,
  templateUrl: "./teams.page.html",
})
export class TeamsPage {
  readonly available = computed(
    () => this.data.teams().filter((team) => team.status === "available").length,
  )
  readonly inService = computed(
    () => this.data.teams().filter((team) => team.status === "in-service").length,
  )
  readonly enRoute = computed(
    () => this.data.teams().filter((team) => team.status === "en-route").length,
  )
  error = ""

  constructor(
    readonly data: AppDataService,
    readonly support: SupportController,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.data.loadTeams().catch((error: unknown) => {
      console.error("Could not load teams.", error)
      this.error = "Não foi possível carregar as equipes."
    })
  }

  async requestSupport(): Promise<void> {
    this.error = ""
    try {
      await this.support.requestSupport()
      await this.router.navigateByUrl("/agente/apoio")
    } catch (error) {
      console.error("Could not request support.", error)
      this.error = error instanceof HttpErrorResponse
        ? error.error?.error ?? "Não foi possível acessar o servidor."
        : "Não foi possível solicitar apoio."
    }
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
