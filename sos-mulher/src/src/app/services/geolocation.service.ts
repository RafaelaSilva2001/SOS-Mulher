import { Injectable } from "@angular/core"
import { Geolocation } from "@capacitor/geolocation"

@Injectable({ providedIn: "root" })
export class GeolocationService {
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
      })
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
    } catch {
      return { latitude: -8.0476, longitude: -34.877 }
    }
  }
}
