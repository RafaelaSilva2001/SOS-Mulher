import { NgModule } from "@angular/core"
import { HttpClientModule } from "@angular/common/http"
import { BrowserModule } from "@angular/platform-browser"
import { FormsModule } from "@angular/forms"
import { RouteReuseStrategy } from "@angular/router"
import { IonicModule, IonicRouteStrategy } from "@ionic/angular"
import { AppComponent } from "./app.component"
import { AppRoutingModule } from "./routes/app-routing.module"
import { AgentDashboardPage } from "./pages/agent-dashboard/agent-dashboard.page"
import { AgentTabsPage } from "./pages/agent-tabs/agent-tabs.page"
import { LoginPage } from "./pages/login/login.page"
import { OccurrenceDetailPage } from "./pages/occurrence-detail/occurrence-detail.page"
import { ProfilePage } from "./pages/profile/profile.page"
import { RegisterPage } from "./pages/register/register.page"
import { SupportStatusPage } from "./pages/support-status/support-status.page"
import { TeamsPage } from "./pages/teams/teams.page"
import { VictimHomePage } from "./pages/victim-home/victim-home.page"
import { VictimTabsPage } from "./pages/victim-tabs/victim-tabs.page"

@NgModule({
  declarations: [
    AppComponent,
    LoginPage,
    RegisterPage,
    VictimTabsPage,
    VictimHomePage,
    ProfilePage,
    AgentTabsPage,
    AgentDashboardPage,
    OccurrenceDetailPage,
    TeamsPage,
    SupportStatusPage,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: "md" }),
    AppRoutingModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
