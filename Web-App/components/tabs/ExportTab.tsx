"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ExportTab() {
  const [leaderboardFormat, setLeaderboardFormat] = useState<"csv" | "pdf">("csv")
  const [AttemptsRange, setAttemptsRange] = useState<"today" | "week">("today")
  const [isExportingLeaderboard, setIsExportingLeaderboard] = useState(false)
  const [isExportingAttempts, setIsExportingAttempts] = useState(false)

  const handleExportLeaderboard = async () => {
    setIsExportingLeaderboard(true)
    try {
      toast.success(`Exporting leaderboard as ${leaderboardFormat.toUpperCase()}...`)
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Leaderboard exported successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to export leaderboard")
    } finally {
      setIsExportingLeaderboard(false)
    }
  }

  const handleExportAttempts = async () => {
    setIsExportingAttempts(true)
    try {
      const today = new Date()
      let fromDate = new Date()
      if (AttemptsRange === "today") {
        fromDate.setHours(0, 0, 0, 0)
      } else if (AttemptsRange === "week") {
        fromDate.setDate(today.getDate() - 7)
      }
      toast.success(`Exporting Attempts for ${AttemptsRange === "today" ? "today" : "this week"}...`)
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Attempts exported successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to export Attempts")
    } finally {
      setIsExportingAttempts(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Data Export</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="leaderboard-format">Format</Label>
              <Select
                value={leaderboardFormat}
                onValueChange={(value) => setLeaderboardFormat(value as "csv" | "pdf")}
              >
                <SelectTrigger id="leaderboard-format" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportLeaderboard}
              disabled={isExportingLeaderboard}
              className="w-full flex items-center gap-2"
            >
              {isExportingLeaderboard ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Leaderboard
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempts Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="race-data-range">Date Range</Label>
              <Select
                value={AttemptsRange}
                onValueChange={(value) => setAttemptsRange(value as "today" | "week")}
              >
                <SelectTrigger id="race-data-range" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportAttempts}
              disabled={isExportingAttempts}
              className="w-full flex items-center gap-2"
            >
              {isExportingAttempts ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Attempts
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
