import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { AuthController } from "../../controllers/auth.controller"

@Component({
  standalone: false,
  templateUrl: "./victim-tabs.page.html",
})
export class VictimTabsPage {
  constructor(
    private readonly auth: AuthController,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.logout()
    void this.router.navigateByUrl("/acesso")
  }
}
