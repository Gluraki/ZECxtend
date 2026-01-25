"use client"
import { useState, useEffect } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Trophy, Loader2 } from "lucide-react"
import { leaderboardApi, type LeaderboardEntry, TeamCategory } from "@/lib/api/leaderboard"
import { challengesApi, type Challenge } from "@/lib/api/challenges"
import { toast } from "sonner"

const CATEGORY_LABELS: Record<TeamCategory, string> = {
  [TeamCategory.CLOSE_TO_SERIES]: "Close to Series",
  [TeamCategory.ADVANCED_CLASS]: "Advanced Class",
  [TeamCategory.PROFESSIONAL_CLASS]: "Professional Class",
}

export default function LeaderboardTab() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory>(TeamCategory.CLOSE_TO_SERIES)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false)

  useEffect(() => {
    loadChallenges()
  }, [])

  useEffect(() => {
    if (selectedChallenge) {
      loadLeaderboard()
    }
  }, [selectedChallenge, selectedCategory])

  const loadChallenges = async () => {
    setIsLoadingChallenges(true)
    try {
      const data = await challengesApi.listChallenges()
      setChallenges(data)
      if (data.length > 0 && !selectedChallenge) {
        setSelectedChallenge(data[0].id)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load challenges")
    } finally {
      setIsLoadingChallenges(false)
    }
  }

  const loadLeaderboard = async () => {
    if (!selectedChallenge) return

    setIsLoading(true)
    try {
      const data = await leaderboardApi.getLeaderboard(selectedChallenge, selectedCategory)
      setLeaderboard(data)
    } catch (error: any) {
      toast.error(error.message || "Failed to load leaderboard")
      setLeaderboard([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (value?: number | null) => {
    if (!value) return "—"
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500 text-white"
      case 2:
        return "bg-gray-400 text-white"
      case 3:
        return "bg-orange-600 text-white"
      default:
        return "bg-blue-600 text-white"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Race Leaderboard</h2>
        <div className="flex gap-4">
          <Select
            value={selectedChallenge?.toString()}
            onValueChange={(value) => setSelectedChallenge(parseInt(value))}
            disabled={isLoadingChallenges}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select challenge" />
            </SelectTrigger>
            <SelectContent>
              {challenges.map((challenge) => (
                <SelectItem key={challenge.id} value={challenge.id.toString()}>
                  {challenge.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as TeamCategory)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <span>{CATEGORY_LABELS[selectedCategory]} Standings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No leaderboard data available for this challenge and category.
                </div>
              )}
              {leaderboard.map((entry, index) => {
                const position = index + 1
                return (
                  <div
                    key={entry.score.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getPositionColor(position)}`}
                      >
                        {position}
                      </div>
                      <div>
                        <div className="font-medium">
                          {entry.team.name}
                        </div>
                        {entry.team.vehicle_weight && (
                          <div className="text-sm text-muted-foreground">
                            Weight: {entry.team.vehicle_weight}kg
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {formatTime(entry.score.value)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Score ID: {entry.score.id}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
