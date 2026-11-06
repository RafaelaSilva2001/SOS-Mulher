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
    } catch (error) {
      console.error("Could not get the device location.", error)
      throw new Error("Não foi possível obter sua localização. Ative o GPS e permita o acesso para solicitar ajuda.")
    }
  }
}
