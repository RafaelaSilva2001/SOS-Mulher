import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { firstValueFrom } from "rxjs"
import {
  AuthSession,
  Occurrence,
  RegisterVictimInput,
  SupportRequest,
  Team,
  User,
  VictimProfile,
} from "../models/app.models"

interface SessionProfile {
  user: User
  profile: VictimProfile | null
}

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly baseUrl = "/api"

  constructor(private readonly http: HttpClient) {}

  login(role: string, cpf: string, password: string): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(`${this.baseUrl}/auth/login`, { role, cpf, password }),
    )
  }

  register(input: RegisterVictimInput): Promise<AuthSession> {
    return firstValueFrom(this.http.post<AuthSession>(`${this.baseUrl}/auth/register`, input))
  }

  session(): Promise<SessionProfile> {
    return firstValueFrom(
      this.http.get<SessionProfile>(`${this.baseUrl}/auth/me`, { headers: this.authHeaders() }),
    )
  }

  updateProfile(
    changes: Partial<Pick<User, "name" | "phone" | "photo">> &
      Partial<Pick<VictimProfile, "address" | "district" | "emergencyContactName" | "emergencyContactPhone">>,
  ): Promise<SessionProfile> {
    return firstValueFrom(
      this.http.patch<SessionProfile>(`${this.baseUrl}/profile`, changes, {
        headers: this.authHeaders(),
      }),
    )
  }

  teams(): Promise<Team[]> {
    return firstValueFrom(
      this.http.get<Team[]>(`${this.baseUrl}/teams`, { headers: this.authHeaders() }),
    )
  }

  occurrences(): Promise<Occurrence[]> {
    return firstValueFrom(
      this.http.get<Occurrence[]>(`${this.baseUrl}/occurrences`, {
        headers: this.authHeaders(),
      }),
    )
  }

  createOccurrence(latitude: number, longitude: number): Promise<Occurrence> {
    return firstValueFrom(
      this.http.post<Occurrence>(
        `${this.baseUrl}/occurrences`,
        { latitude, longitude },
        { headers: this.authHeaders() },
      ),
    )
  }

  acceptOccurrence(id: string): Promise<Occurrence> {
    return firstValueFrom(
      this.http.patch<Occurrence>(
        `${this.baseUrl}/occurrences/${encodeURIComponent(id)}/accept`,
        {},
        { headers: this.authHeaders() },
      ),
    )
  }

  finishOccurrence(id: string): Promise<Occurrence> {
    return firstValueFrom(
      this.http.patch<Occurrence>(
        `${this.baseUrl}/occurrences/${encodeURIComponent(id)}/finish`,
        {},
        { headers: this.authHeaders() },
      ),
    )
  }

  requestSupport(): Promise<SupportRequest> {
    return firstValueFrom(
      this.http.post<SupportRequest>(
        `${this.baseUrl}/support-requests`,
        {},
        { headers: this.authHeaders() },
      ),
    )
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem("sos-mulher-token")
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders()
  }
}
