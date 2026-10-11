import { MAX_LIMIT, request } from "@/api/client"
import type { AttemptCreate, Challenge, Driver, MacField, PenaltyType, Team } from "@/lib/types"

export const listTeams = () => request<Team[]>("/teams/", { query: { limit: MAX_LIMIT } })

export const listDrivers = (teamId: number) =>
    request<Driver[]>("/drivers/", { query: { team_id: teamId, limit: MAX_LIMIT } })

export const listChallenges = () => request<Challenge[]>("/challenges/")

export const updateChallengeMac = (id: number, field: MacField, mac: string) =>
    request<Challenge>(`/challenges/${id}`, { method: "PUT", body: { [field]: mac } })

export const listPenaltyTypes = () => request<PenaltyType[]>("/penalties/types/")

export const createAttempt = (attempt: AttemptCreate) =>
    request<unknown>("/attempts/", { method: "POST", body: attempt })
