import { MAX_LIMIT, request } from "@/api/client"
import type { Team, TeamCreate, TeamUpdate } from "@/types/team"

export const listTeams = () => request<Team[]>("/teams/", { query: { limit: MAX_LIMIT } })

export const getTeam = (id: number) => request<Team>(`/teams/${id}`)

export const createTeam = (data: TeamCreate) => request<Team>("/teams/", { method: "POST", body: data })

export const updateTeam = (id: number, data: TeamUpdate) =>
  request<Team>(`/teams/${id}`, { method: "PUT", body: data })

export const deleteTeam = (id: number) => request<Team>(`/teams/${id}`, { method: "DELETE" })
