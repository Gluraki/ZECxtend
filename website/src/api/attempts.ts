import { MAX_LIMIT, request } from "@/api/client"
import type { Attempt, AttemptUpdate } from "@/types/attempt"

export const listAttempts = (challengeId: number) =>
  request<Attempt[]>("/attempts/", { query: { challenge_id: challengeId, limit: MAX_LIMIT } })

export const updateAttempt = (id: number, data: AttemptUpdate) =>
  request<Attempt>(`/attempts/${id}`, { method: "PUT", body: data })

export const setAttemptValidity = (id: number, isValid: boolean) =>
  request<Attempt>(`/attempts/${id}/validity`, { method: "PATCH", body: { is_valid: isValid } })

export const deleteAttempt = (id: number) => request<Attempt>(`/attempts/${id}`, { method: "DELETE" })
