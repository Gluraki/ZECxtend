'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { SERVER_API_URL } from "@/next.config"
import { medianTimestamp } from "@/components/medianTimestamp" // or wherever your helper is
import { Attempt, Penalty } from "@/components/types"

interface AttemptResultCardProps {
    selectedTeam: { id: number } | null
    selectedDriver: { id: number } | null
    selectedChallenge: { id: number } | null
    attemptNr: number
    selectedStartTimestamps: string[]
    selectedEndTimestamps: string[]
    energyConsumption: number
    selectedPenalty: Penalty | null
    penaltyCount: number
}

export function AttemptResultCard({
    selectedTeam,
    selectedDriver,
    selectedChallenge,
    attemptNr,
    selectedStartTimestamps,
    selectedEndTimestamps,
    energyConsumption,
    selectedPenalty,
    penaltyCount,
}: AttemptResultCardProps) {

    const calcAttemptTime = (): string => {
        if (!selectedStartTimestamps?.length || !selectedEndTimestamps?.length) {
            return "00:00:0000"
        }

        const startMs = medianTimestamp(selectedStartTimestamps)
        const endMs = medianTimestamp(selectedEndTimestamps)
        const penaltyMs = ((penaltyCount ?? 0) * (selectedPenalty?.amount ?? 0)) * 1000

        const attemptMs = endMs - startMs + penaltyMs

        const hours = Math.floor(attemptMs / 3600000)
        const minutes = Math.floor((attemptMs % 3600000) / 60000)
        const seconds = Math.floor((attemptMs % 60000) / 1000)
        const milliseconds = attemptMs % 1000

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(4, "0")}`
    }

    const createAttempt = () => {
        if (!selectedTeam?.id) return alert("Please select a team!")
        if (!selectedDriver?.id) return alert("Please select a driver!")
        if (!selectedChallenge?.id) return alert("Please select a challenge!")
        if (!attemptNr || attemptNr <= 0) return alert("Please enter a valid attempt number!")
        if (!selectedStartTimestamps?.length) return alert("Please select at least one start timestamp!")
        if (!selectedEndTimestamps?.length) return alert("Please select at least one end timestamp!")
        if (!energyConsumption || energyConsumption <= 0) return alert("Please enter energy consumption!")
        if (!selectedPenalty?.type) return alert("Please select a penalty!")

        const attempt: Attempt = {
            team_id: selectedTeam.id,
            driver_id: selectedDriver.id,
            challenge_id: selectedChallenge.id,
            attempt_number: attemptNr,
            start_time: new Date(medianTimestamp(selectedStartTimestamps)),
            end_time: new Date(medianTimestamp(selectedEndTimestamps)),
            energy_used: energyConsumption,
            penalty_id: selectedPenalty.id,
            penalty_count: penaltyCount ?? 0,
        }

        axios.post(`${SERVER_API_URL}/attempts/`, attempt)
            .then(() => alert("Attempt submitted successfully!"))
            .catch((error) => {
                console.error("Failed to submit attempt", error)
                alert("Failed to submit attempt! No connection to server possible")
            })
    }

    return (
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p>Result = {calcAttemptTime()}</p>
                <Button variant="outline" onClick={createAttempt}>
                    Submit
                </Button>
            </CardContent>
        </Card>
    )
}
