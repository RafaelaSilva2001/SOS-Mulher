import { Component, computed, signal } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { Router } from "@angular/router"
import { AuthController } from "../../controllers/auth.controller"
import { OccurrenceController } from "../../controllers/occurrence.controller"

@Component({
  standalone: false,
  templateUrl: "./victim-home.page.html",
})
export class VictimHomePage {
  readonly user = this.auth.currentUser
  readonly occurrence = this.occurrences.currentVictimOccurrence
  readonly loading = signal(false)
  readonly firstName = computed(() => this.user()?.name.split(" ")[0] ?? "")
  error = ""

  constructor(
    private readonly auth: AuthController,
    private readonly occurrences: OccurrenceController,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.occurrences.load().catch((error: unknown) => {
      console.error("Could not load occurrences.", error)
      this.error = "Não foi possível carregar seus chamados."
    })
  }

  async requestHelp(): Promise<void> {
    this.error = ""
    this.loading.set(true)
    try {
      await this.occurrences.requestHelp()
    } catch (error) {
      console.error("Help request failed.", error)
      this.error = error instanceof HttpErrorResponse
        ? error.error?.error ?? "Não foi possível acessar o servidor."
        : error instanceof Error ? error.message : "Não foi possível solicitar ajuda."
    } finally {
      this.loading.set(false)
    }
  }

  openProfile(): void {
    void this.router.navigateByUrl("/vitima/perfil")
  }

  statusLabel(status: string): string {
    if (status === "accepted") return "Equipe a caminho"
    if (status === "finished") return "Atendimento concluído"
    return "Alerta ativo"
  }

  statusTitle(status: string): string {
    if (status === "accepted") return "Equipe em deslocamento"
    if (status === "finished") return "Atendimento finalizado"
    return "Ajuda está a caminho"
  }

  statusDescription(status: string): string {
    if (status === "accepted") return "Uma equipe confirmou o chamado e está indo até você."
    if (status === "finished") return "A equipe confirmou a conclusão do atendimento."
    return "Sua localização está sendo compartilhada com a central."
  }
}
