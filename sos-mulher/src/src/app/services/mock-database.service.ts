import { Injectable, signal } from "@angular/core"
import {
  Agent,
  Occurrence,
  Team,
  User,
  UserRole,
  VictimProfile,
} from "../models/app.models"

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1631377307692-36a9b6ae3ef6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600"

@Injectable({ providedIn: "root" })
export class MockDatabaseService {
  readonly users = signal<User[]>([
    {
      id: "victim-mariana-user",
      role: "victim",
      name: "Mariana Alves",
      cpf: "123.456.789-00",
      password: "12345678",
      phone: "(81) 99942-7810",
      photo: DEFAULT_PHOTO,
    },
    {
      id: "victim-rafaela-user",
      role: "victim",
      name: "Rafaela Souza",
      cpf: "111.111.111-11",
      password: "12345678",
      phone: "(81) 99111-1111",
      photo:
        "https://images.unsplash.com/photo-1656473031961-9d5d9ee19f40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600",
    },
    {
      id: "agent-lima-user",
      role: "agent",
      name: "Agente Lima",
      cpf: "987.654.321-00",
      password: "12345678",
      phone: "(81) 98810-1001",
    },
  ])

  readonly victimProfiles = signal<VictimProfile[]>([
    {
      id: "victim-mariana",
      userId: "victim-mariana-user",
      address: "Rua das Acácias, 182",
      district: "Boa Vista",
      city: "Recife",
      state: "PE",
      emergencyContactName: "Ana Alves",
      emergencyContactPhone: "(81) 99621-4508",
    },
    {
      id: "victim-rafaela",
      userId: "victim-rafaela-user",
      address: "Rua da Aurora, 450",
      district: "Santo Amaro",
      city: "Recife",
      state: "PE",
      emergencyContactName: "Renata Souza",
      emergencyContactPhone: "(81) 99222-2222",
    },
  ])

  readonly agents = signal<Agent[]>([
    { id: "agent-lima", userId: "agent-lima-user", registration: "1247", teamId: "alpha" },
  ])

  readonly teams = signal<Team[]>([
    { id: "alpha", name: "Equipe Alfa", members: ["Agente Lima", "Agente Souza"], status: "available", base: "Central Recife" },
    { id: "bravo", name: "Equipe Bravo", members: ["Agente Ribeiro", "Agente Costa"], status: "available", base: "Setor Sul" },
    { id: "charlie", name: "Equipe Charlie", members: ["Agente Oliveira", "Agente Melo"], status: "in-service", base: "Setor Centro" },
    { id: "delta", name: "Equipe Delta", members: ["Agente Nunes", "Agente Barbosa"], status: "available", base: "Setor Norte" },
  ])

  readonly occurrences = signal<Occurrence[]>([])

  findUser(role: UserRole, cpf: string, password: string): User | undefined {
    return this.users().find(
      (user) => user.role === role && user.cpf === cpf && user.password === password,
    )
  }

  getUser(id: string): User | undefined {
    return this.users().find((user) => user.id === id)
  }

  getVictimProfile(userId: string): VictimProfile | undefined {
    return this.victimProfiles().find((profile) => profile.userId === userId)
  }

  updateUser(userId: string, changes: Partial<User>): void {
    this.users.update((users) =>
      users.map((user) => (user.id === userId ? { ...user, ...changes } : user)),
    )
  }

  updateVictimProfile(userId: string, changes: Partial<VictimProfile>): void {
    this.victimProfiles.update((profiles) =>
      profiles.map((profile) =>
        profile.userId === userId ? { ...profile, ...changes } : profile,
      ),
    )
  }

  addVictim(user: User, profile: VictimProfile): void {
    this.users.update((users) => [...users, user])
    this.victimProfiles.update((profiles) => [...profiles, profile])
  }

  saveOccurrence(occurrence: Occurrence): void {
    this.occurrences.update((items) => [occurrence, ...items])
  }

  updateOccurrence(id: string, changes: Partial<Occurrence>): void {
    this.occurrences.update((items) =>
      items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    )
  }

  updateTeam(id: string, changes: Partial<Team>): void {
    this.teams.update((teams) =>
      teams.map((team) => (team.id === id ? { ...team, ...changes } : team)),
    )
  }
}
