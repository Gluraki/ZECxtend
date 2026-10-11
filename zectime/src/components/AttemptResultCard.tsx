import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createAttempt } from "@/api/endpoints"
import { durationToMicros, formatDuration, secondsToMicros, toApiDateTime } from "@/lib/timestamps"
import type { Challenge, Driver, PenaltyType, Team } from "@/lib/types"

interface AttemptResultCardProps {
    selectedTeam: Team | null
    selectedDriver: Driver | null
    selectedChallenge: Challenge | null
    startMicros: number | null
    endMicros: number | null
    manualAttemptTime: string | null
    energyConsumption: number
    selectedPenalty: PenaltyType | null
    penaltyCount: number
    onSubmitSuccess: () => void
}

export function AttemptResultCard({
    selectedTeam,
    selectedDriver,
    selectedChallenge,
    startMicros,
    endMicros,
    manualAttemptTime,
    energyConsumption,
    selectedPenalty,
    penaltyCount,
    onSubmitSuccess,
}: AttemptResultCardProps) {
    const [submitting, setSubmitting] = useState(false)

    const penaltySeconds = penaltyCount * (selectedPenalty?.amount ?? 0)

    const calcAttemptMicros = () => {
        let attempt = 0
        if (manualAttemptTime) {
            attempt = durationToMicros(manualAttemptTime)
        } else if (startMicros !== null && endMicros !== null) {
            attempt = endMicros - startMicros
        }
        return attempt + secondsToMicros(penaltySeconds)
    }

    const submit = async () => {
        if (!selectedTeam) return alert("Please select a team!")
        if (!selectedDriver) return alert("Please select a driver!")
        if (!selectedChallenge) return alert("Please select a challenge!")
        if (!energyConsumption || energyConsumption <= 0) return alert("Please enter energy consumption!")
        if (penaltyCount > 0 && !selectedPenalty) return alert("Please select a penalty!")

        let start: number
        let end: number

        if (manualAttemptTime) {
            // Anchor manual times at "now"; the +1µs keeps the sub-second part non-zero, which the API requires.
            start = Date.now() * 1000 + 1
            end = start + durationToMicros(manualAttemptTime)
        } else {
            if (startMicros === null || endMicros === null) {
                return alert("Please provide start and end timestamps!")
            }
            start = startMicros
            end = endMicros
        }

        setSubmitting(true)
        try {
            await createAttempt({
                team_id: selectedTeam.id,
                driver_id: selectedDriver.id,
                challenge_id: selectedChallenge.id,
                start_time: toApiDateTime(start),
                end_time: toApiDateTime(end),
                energy_used: energyConsumption,
                penalty_type: penaltyCount > 0 ? selectedPenalty?.id ?? null : null,
                penalty_count: penaltyCount,
            })
            alert("Attempt submitted successfully!")
            onSubmitSuccess()
        } catch (error) {
            alert(`Failed to submit attempt: ${error instanceof Error ? error.message : String(error)}`)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p className="bold text-2xl">Result = {formatDuration(calcAttemptMicros())}</p>

                <div className="flex flex-col gap-1">
                    <p>Penalty = {selectedPenalty?.amount ?? 0} * {penaltyCount} = {penaltySeconds}</p>
                    <p>Challenge = {selectedChallenge?.name ?? "None"}</p>
                    <p>Team = {selectedTeam?.name ?? "None"}</p>
                    <p>Driver = {selectedDriver?.name ?? "None"}</p>
                </div>
                <Button variant="outline" onClick={() => void submit()} disabled={submitting}>
                    Submit
                </Button>
            </CardContent>
        </Card>
    )
}
