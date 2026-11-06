import { Component } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { Router } from "@angular/router"
import { AuthController } from "../../controllers/auth.controller"
import { UserRole } from "../../models/app.models"
import { formatCpf } from "../../utils/masks"

@Component({
  standalone: false,
  templateUrl: "./login.page.html",
})
export class LoginPage {
  role: UserRole = "victim"
  cpf = "123.456.789-00"
  password = "12345678"
  error = ""

  constructor(
    private readonly auth: AuthController,
    private readonly router: Router,
  ) {}

  selectRole(role: UserRole): void {
    this.error = ""
    this.cpf = role === "victim" ? "123.456.789-00" : "987.654.321-00"
  }

  maskCpf(event: CustomEvent): void {
    this.cpf = formatCpf(String(event.detail.value ?? ""))
  }

  async login(): Promise<void> {
    this.error = ""
    try {
      if (!(await this.auth.login(this.role, this.cpf, this.password))) {
        this.error = "CPF ou senha não encontrados para este perfil."
        return
      }
      if (this.role === "agent") this.playSiren()
      await this.router.navigateByUrl(
        this.role === "victim" ? "/vitima/inicio" : "/agente/ocorrencias",
      )
    } catch (error) {
      console.error("Login failed.", error)
      this.error = error instanceof HttpErrorResponse
        ? error.error?.error ?? "Não foi possível acessar o servidor."
        : "Não foi possível concluir o login."
    }
  }

  private playSiren(): void {
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
