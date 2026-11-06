import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { AuthController } from "../../controllers/auth.controller"
import { User, VictimProfile } from "../../models/app.models"
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

  submit(): void {
    const id = `victim-${Date.now()}`
    const user: User = {
      id: `${id}-user`,
      role: "victim",
      name: this.name,
      cpf: this.cpf,
      phone: this.phone,
      password: this.password,
      photo: this.photo,
    }
    const profile: VictimProfile = {
      id,
      userId: user.id,
      address: this.address,
      district: this.district,
      city: "Recife",
      state: "PE",
      emergencyContactName: this.emergencyName,
      emergencyContactPhone: this.emergencyPhone,
    }
    this.auth.registerVictim(user, profile)
    void this.router.navigateByUrl("/vitima/inicio")
  }
}
