import { Component, computed } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { OccurrenceController } from "../../controllers/occurrence.controller"
import { MockDatabaseService } from "../../services/mock-database.service"

@Component({
  standalone: false,
  templateUrl: "./occurrence-detail.page.html",
})
export class OccurrenceDetailPage {
  private readonly id = this.route.snapshot.paramMap.get("id") ?? ""
  readonly occurrence = computed(() =>
    this.occurrences.occurrences().find((item) => item.id === this.id),
  )
  readonly victim = computed(() => {
    const item = this.occurrence()
    return item ? this.database.getUser(item.victimUserId) : undefined
  })
  readonly profile = computed(() => {
    const item = this.occurrence()
    return item ? this.database.getVictimProfile(item.victimUserId) : undefined
  })

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly occurrences: OccurrenceController,
    private readonly database: MockDatabaseService,
  ) {}

  statusLabel(status: string): string {
    if (status === "accepted") return "Equipe em deslocamento"
    if (status === "finished") return "Atendimento finalizado"
    return "Emergência ativa"
  }

  accept(id: string): void {
    this.occurrences.accept(id)
  }

  finish(id: string): void {
    this.occurrences.finish(id)
  }

  back(): void {
    void this.router.navigateByUrl("/agente/ocorrencias")
  }
}
