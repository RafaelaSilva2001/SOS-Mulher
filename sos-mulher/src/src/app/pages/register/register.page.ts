import { Component } from "@angular/core"
import { HttpErrorResponse } from "@angular/common/http"
import { Router } from "@angular/router"
import { AuthController } from "../../controllers/auth.controller"
import { formatCpf, formatPhone } from "../../utils/masks"

@Component({
  standalone: false,
  templateUrl: "./register.page.html",
})
export class RegisterPage {
  readonly formatCpf = formatCpf
  name = ""
  cpf = ""
  phone = ""
  address = ""
  district = ""
  emergencyName = ""
  emergencyPhone = ""
  password = ""
  photo?: string
  accepted = false
  error = ""

  constructor(
    private readonly auth: AuthController,
    private readonly router: Router,
  ) {}

  get canSubmit(): boolean {
    return Boolean(this.accepted && this.name && this.cpf && this.phone && this.password)
  }

  formatCpfValue(event: CustomEvent): string {
    return formatCpf(String(event.detail.value ?? ""))
  }

  formatPhoneValue(event: CustomEvent): string {
    return formatPhone(String(event.detail.value ?? ""))
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => (this.photo = String(reader.result))
    reader.readAsDataURL(file)
  }

  async submit(): Promise<void> {
    this.error = ""
    try {
      await this.auth.registerVictim({
        name: this.name,
        cpf: this.cpf,
        phone: this.phone,
        password: this.password,
        photo: this.photo,
        address: this.address,
        district: this.district,
        emergencyContactName: this.emergencyName,
        emergencyContactPhone: this.emergencyPhone,
        accepted: true,
      })
      await this.router.navigateByUrl("/vitima/inicio")
    } catch (error) {
      console.error("Registration failed.", error)
      this.error = error instanceof HttpErrorResponse
        ? error.error?.error ?? "Não foi possível acessar o servidor."
        : "Não foi possível concluir o cadastro."
    }
  }
}
