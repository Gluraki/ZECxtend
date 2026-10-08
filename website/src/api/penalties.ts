import { MAX_LIMIT, request } from "@/api/client"
import type { Penalty, PenaltyCreate, PenaltyType } from "@/types/penalty"

export const listPenaltyTypes = () => request<PenaltyType[]>("/penalties/types/")

export const listPenalties = (attemptId: number) =>
  request<Penalty[]>("/penalties/", { query: { attempt_id: attemptId, limit: MAX_LIMIT } })

export const createPenalty = (data: PenaltyCreate) =>
  request<Penalty>("/penalties/", { method: "POST", body: data })

export const updatePenaltyCount = (id: number, count: number) =>
  request<Penalty>(`/penalties/${id}`, { method: "PUT", body: { count } })

export const deletePenalty = (id: number) => request<Penalty>(`/penalties/${id}`, { method: "DELETE" })
