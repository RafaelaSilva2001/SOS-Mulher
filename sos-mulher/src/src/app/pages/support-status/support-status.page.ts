import { Component, computed } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { Router } from "@angular/router"
import { SupportController } from "../../controllers/support.controller"
import { AppDataService } from "../../services/app-data.service"

@Component({
  standalone: false,
  templateUrl: "./support-status.page.html",
})
export class SupportStatusPage {
  error = ""
  readonly assignedTeam = computed(() => {
    const teamId = this.support.request().assignedTeamId
    return this.data.teams().find((team) => team.id === teamId)
  })

  constructor(
    readonly support: SupportController,
    readonly data: AppDataService,
    private readonly router: Router,
  ) {
    if (this.support.request().status === "idle") {
      void this.support.requestSupport().catch((error: unknown) => {
        console.error("Could not request support.", error)
        this.error = error instanceof HttpErrorResponse
          ? error.error?.error ?? "Não foi possível acessar o servidor."
          : "Não foi possível solicitar apoio."
      })
    }
  }

  back(): void {
    void this.router.navigateByUrl("/agente/equipes")
  }
}
