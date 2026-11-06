import { Component, effect } from "@angular/core"
import { AuthController } from "../../controllers/auth.controller"
import { formatPhone } from "../../utils/masks"

@Component({
  standalone: false,
  templateUrl: "./profile.page.html",
})
export class ProfilePage {
  editing = false
  name = ""
  phone = ""
  photo = ""
  address = ""
  district = ""
  emergencyName = ""
  emergencyPhone = ""

  constructor(private readonly auth: AuthController) {
    effect(() => {
      const user = this.auth.currentUser()
      const profile = this.auth.victimProfile()
      if (!user || !profile) return
      this.name = user.name
      this.phone = user.phone
      this.photo = user.photo ?? ""
      this.address = profile.address
      this.district = profile.district
      this.emergencyName = profile.emergencyContactName
      this.emergencyPhone = profile.emergencyContactPhone
    })
  }

  maskPhone(event: CustomEvent): string {
    return formatPhone(String(event.detail.value ?? ""))
  }

  selectPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => (this.photo = String(reader.result))
    reader.readAsDataURL(file)
  }

  toggleEdit(): void {
    if (this.editing) {
      this.auth.updateVictim(
        { name: this.name, phone: this.phone, photo: this.photo },
        {
          address: this.address,
          district: this.district,
          emergencyContactName: this.emergencyName,
          emergencyContactPhone: this.emergencyPhone,
        },
      )
    }
    this.editing = !this.editing
  }
}
