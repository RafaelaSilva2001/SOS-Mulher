import { Component, computed, signal } from "@angular/core"
import { Router } from "@angular/router"
import { OccurrenceController } from "../../controllers/occurrence.controller"
import { Occurrence, OccurrenceStatus } from "../../models/app.models"
import { MockDatabaseService } from "../../services/mock-database.service"

@Component({
  standalone: false,
  templateUrl: "./agent-dashboard.page.html",
})
export class AgentDashboardPage {
  readonly filter = signal<OccurrenceStatus>("open")
  readonly visibleOccurrences = computed(() =>
    this.occurrences.byStatus(this.filter()),
  )
  readonly activeCount = computed(
    () => this.occurrences.occurrences().filter((item) => item.status !== "finished").length,
  )
  readonly finishedCount = computed(
    () => this.occurrences.occurrences().filter((item) => item.status === "finished").length,
  )

  constructor(
    private readonly occurrences: OccurrenceController,
    private readonly database: MockDatabaseService,
    private readonly router: Router,
  ) {}

  changeFilter(event: CustomEvent): void {
    this.filter.set(event.detail.value as OccurrenceStatus)
  }

  victim(item: Occurrence) {
    return this.database.getUser(item.victimUserId)
  }

  address(item: Occurrence): string {
    const profile = this.database.getVictimProfile(item.victimUserId)
    return profile ? `${profile.address} · ${profile.district}` : "Localização recebida"
  }

  label(status: OccurrenceStatus): string {
    if (status === "accepted") return "Equipe em deslocamento"
    if (status === "finished") return "Finalizado"
    return "Emergência"
  }

  emptyTitle(): string {
    if (this.filter() === "accepted") return "Nenhuma ocorrência com equipe"
    if (this.filter() === "finished") return "Nenhuma ocorrência finalizada"
    return "Nenhuma ocorrência em aberto"
  }

  open(item: Occurrence): void {
    void this.router.navigate(["/agente/ocorrencias", item.id])
  }

  playSiren(): void {
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(620, context.currentTime)
    oscillator.frequency.linearRampToValueAtTime(940, context.currentTime + 0.5)
    gain.gain.setValueAtTime(0.1, context.currentTime)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.8)
  }
}
