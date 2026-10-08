import { request } from "@/api/client"
import type { Challenge, ChallengeUpdate } from "@/types/challenge"

export const listChallenges = () => request<Challenge[]>("/challenges/")

export const updateChallenge = (id: number, data: ChallengeUpdate) =>
  request<Challenge>(`/challenges/${id}`, { method: "PUT", body: data })
