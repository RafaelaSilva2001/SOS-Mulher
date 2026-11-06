import { NgModule } from "@angular/core"
import { PreloadAllModules, RouterModule, Routes } from "@angular/router"
import { AgentDashboardPage } from "../pages/agent-dashboard/agent-dashboard.page"
import { AgentTabsPage } from "../pages/agent-tabs/agent-tabs.page"
import { LoginPage } from "../pages/login/login.page"
import { OccurrenceDetailPage } from "../pages/occurrence-detail/occurrence-detail.page"
import { ProfilePage } from "../pages/profile/profile.page"
import { RegisterPage } from "../pages/register/register.page"
import { SupportStatusPage } from "../pages/support-status/support-status.page"
import { TeamsPage } from "../pages/teams/teams.page"
import { VictimHomePage } from "../pages/victim-home/victim-home.page"
import { VictimTabsPage } from "../pages/victim-tabs/victim-tabs.page"

const routes: Routes = [
  { path: "acesso", component: LoginPage },
  { path: "cadastro", component: RegisterPage },
  {
    path: "vitima",
    component: VictimTabsPage,
    children: [
      { path: "inicio", component: VictimHomePage },
      { path: "perfil", component: ProfilePage },
      { path: "", pathMatch: "full", redirectTo: "inicio" },
    ],
  },
  {
    path: "agente",
    component: AgentTabsPage,
    children: [
      { path: "ocorrencias", component: AgentDashboardPage },
      { path: "ocorrencias/:id", component: OccurrenceDetailPage },
      { path: "equipes", component: TeamsPage },
      { path: "apoio", component: SupportStatusPage },
      { path: "", pathMatch: "full", redirectTo: "ocorrencias" },
    ],
  },
  { path: "", pathMatch: "full", redirectTo: "acesso" },
  { path: "**", redirectTo: "acesso" },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
