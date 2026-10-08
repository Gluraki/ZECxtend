import { useState } from "react"
import { listChallenges } from "@/api/challenges"
import { useApiData } from "@/hooks/use-api-data"

export function useChallengeSelection() {
  const { data: challenges, loading } = useApiData(listChallenges, [], [])
  const [selected, setSelected] = useState<number | null>(null)
  const challengeId = selected ?? challenges[0]?.id ?? null

  return { challenges, loading, challengeId, setChallengeId: setSelected }
}
