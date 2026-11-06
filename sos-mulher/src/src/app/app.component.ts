import { Component } from "@angular/core"
import { addIcons } from "ionicons"
import {
  arrowBackOutline,
  cameraOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  homeOutline,
  locateOutline,
  lockClosedOutline,
  logOutOutline,
  navigateOutline,
  notificationsOutline,
  peopleOutline,
  personOutline,
  phonePortraitOutline,
  radioOutline,
  shieldCheckmarkOutline,
  warningOutline,
} from "ionicons/icons"

@Component({
  selector: "app-root",
  standalone: false,
  templateUrl: "./app.component.html",
})
export class AppComponent {
  constructor() {
    addIcons({
      arrowBackOutline,
      cameraOutline,
      checkmarkCircleOutline,
      chevronForwardOutline,
      homeOutline,
      locateOutline,
      lockClosedOutline,
      logOutOutline,
      navigateOutline,
      notificationsOutline,
      peopleOutline,
      personOutline,
      phonePortraitOutline,
      radioOutline,
      shieldCheckmarkOutline,
      warningOutline,
    })
  }
}
