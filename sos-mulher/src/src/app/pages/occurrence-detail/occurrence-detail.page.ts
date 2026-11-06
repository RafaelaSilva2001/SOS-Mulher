import { Component, computed } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { ActivatedRoute, Router } from "@angular/router"
import { OccurrenceController } from "../../controllers/occurrence.controller"

@Component({
  standalone: false,
  templateUrl: "./occurrence-detail.page.html",
})
export class OccurrenceDetailPage {
  private readonly id = this.route.snapshot.paramMap.get("id") ?? ""
  error = ""
  readonly occurrence = computed(() =>
    this.occurrences.occurrences().find((item) => item.id === this.id),
  )
  readonly victim = computed(() => this.occurrence()?.victim)
  readonly profile = computed(() => this.occurrence()?.profile)

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly occurrences: OccurrenceController,
  ) {}

  ngOnInit(): void {
    void this.occurrences.load().catch((error: unknown) => {
      console.error("Could not load occurrence details.", error)
      this.error = "Não foi possível carregar os detalhes do chamado."
    })
  }

  statusLabel(status: string): string {
    if (status === "accepted") return "Equipe em deslocamento"
    if (status === "finished") return "Atendimento finalizado"
    return "Emergência ativa"
  }

  async accept(id: string): Promise<void> {
    await this.updateStatus(() => this.occurrences.accept(id))
  }

  async finish(id: string): Promise<void> {
    await this.updateStatus(() => this.occurrences.finish(id))
  }

  private async updateStatus(update: () => Promise<void>): Promise<void> {
    this.error = ""
    try {
      await update()
    } catch (error) {
      console.error("Could not update occurrence status.", error)
      this.error = error instanceof HttpErrorResponse
        ? error.error?.error ?? "Não foi possível acessar o servidor."
        : "Não foi possível atualizar o chamado."
    }
  }

  back(): void {
    void this.router.navigateByUrl("/agente/ocorrencias")
  }
}
