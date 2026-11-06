import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { AuthController } from "../../controllers/auth.controller"

@Component({
  standalone: false,
  templateUrl: "./agent-tabs.page.html",
})
export class AgentTabsPage {
  constructor(
    private readonly auth: AuthController,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.logout()
    void this.router.navigateByUrl("/acesso")
  }
}
