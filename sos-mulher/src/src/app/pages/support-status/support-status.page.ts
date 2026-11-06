import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { SupportController } from "../../controllers/support.controller"
import { MockDatabaseService } from "../../services/mock-database.service"

@Component({
  standalone: false,
  templateUrl: "./support-status.page.html",
})
export class SupportStatusPage {
  constructor(
    readonly support: SupportController,
    readonly database: MockDatabaseService,
    private readonly router: Router,
  ) {
    if (this.support.request().status === "idle") this.support.requestSupport()
  }

  back(): void {
    void this.router.navigateByUrl("/agente/equipes")
  }
}
