'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FormulaCardProps {
    medianStartTimestamp: string
    medianEndTimestamp: string
    manualAttemptTime: string | null
    penaltyCount: number
    selectedPenaltyAmount: number
}

export function FormulaCard({
    medianStartTimestamp,
    medianEndTimestamp,
    manualAttemptTime,
    penaltyCount,
    selectedPenaltyAmount,
}: FormulaCardProps) {
    const formatTimestampUTC = (isoString: string): string => {
        if (!isoString) return "00:00:00:000"

        const date = new Date(isoString)

        const hours = String(date.getUTCHours()).padStart(2, "0")
        const minutes = String(date.getUTCMinutes()).padStart(2, "0")
        const seconds = String(date.getUTCSeconds()).padStart(2, "0")
        const milliseconds = String(date.getUTCMilliseconds()).padStart(3, "0")

        return `${hours}:${minutes}:${seconds}:${milliseconds}`
    }

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Formula</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Attempt time formula = end time - start time + (amount of penalties * time penalty)</p>

                {manualAttemptTime == null ? (
                    <p className="text-sm text-muted-foreground">
                        Attempt time formula = {formatTimestampUTC(medianEndTimestamp)} -{" "}
                        {formatTimestampUTC(medianStartTimestamp)} + ({penaltyCount} *{" "}
                        {selectedPenaltyAmount})
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Attempt time formula = {manualAttemptTime} + ({penaltyCount} *{" "}
                        {selectedPenaltyAmount})
                    </p>
                )}
            </CardContent>
        </Card>
    )
}