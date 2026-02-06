'use client'

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FormulaCardProps {
    medianStartTimestamp: string
    medianEndTimestamp: string
    manualAttemptTime: string | null
    penaltyCount: number
    selectedPenaltyAmount: number
    setManualTimestamp: (timestamp: string | null) => void
}

export function FormulaCard({
    medianStartTimestamp,
    medianEndTimestamp,
    manualAttemptTime,
    penaltyCount,
    selectedPenaltyAmount,
    setManualTimestamp,
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

                <div className="flex flex-col gap-2 mt-4">
                    <label className="flex items-center gap-2">
                        <span>Manual Attempt Time:</span>
                        <TimeSplitInput
                            key={manualAttemptTime?.toString()}
                            initialTime={manualAttemptTime ?? undefined}
                            onChange={(fullTimestamp) => setManualTimestamp(fullTimestamp)}
                        />
                    </label>
                </div>
            </CardContent>
        </Card>
    )
}

/* ------------------- TimeSplitInput ------------------- */

interface TimeSplitInputProps {
    onChange: (time: string) => void
    initialTime?: string
}

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
}

function normalizeTimeUTC(isoString?: string): [string, string, string] {
    if (!isoString) return ["00", "00", "00"]

    // Check if it's already in HH:MM:SS format
    if (/^\d{2}:\d{2}:\d{2}$/.test(isoString)) {
        const parts = isoString.split(':')
        return [parts[0], parts[1], parts[2]]
    }

    const d = new Date(isoString)

    return [
        String(d.getUTCHours()).padStart(2, "0"),
        String(d.getUTCMinutes()).padStart(2, "0"),
        String(d.getUTCSeconds()).padStart(2, "0"),
    ]
}

function TimeSplitInput({ onChange, initialTime }: TimeSplitInputProps) {
    const [hours, setHours] = useState("00")
    const [minutes, setMinutes] = useState("00")
    const [seconds, setSeconds] = useState("00")

    const hRef = useRef<HTMLInputElement>(null)
    const mRef = useRef<HTMLInputElement>(null)
    const sRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const [h, m, s] = normalizeTimeUTC(initialTime)
        setHours(h || "00")
        setMinutes(m || "00")
        setSeconds(s || "00")
    }, [initialTime])

    const focusNext = (ref?: React.RefObject<HTMLInputElement | null>) => {
        ref?.current?.focus()
        ref?.current?.select()
    }

    const handleTyping =
        (
            setter: (v: string) => void,
            max: number,
            nextRef?: React.RefObject<HTMLInputElement | null>
        ) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                let val = e.target.value.replace(/\D/g, "").slice(0, 2)
                setter(val)
                if (val.length === 2) focusNext(nextRef)
            }

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement>,
        max: number,
        type: "h" | "m" | "s"
    ) => {
        const value = e.target.value
        const num = clamp(Number(value || 0), 0, max)
        const formatted = String(num).padStart(2, "0")
        if (type === "h") setHours(formatted)
        else if (type === "m") setMinutes(formatted)
        else setSeconds(formatted)
    }

    const handleSubmit = () => {
        // Ensure all values are properly formatted
        const h = String(clamp(Number(hours || 0), 0, 23)).padStart(2, "0")
        const m = String(clamp(Number(minutes || 0), 0, 59)).padStart(2, "0")
        const s = String(clamp(Number(seconds || 0), 0, 59)).padStart(2, "0")

        setHours(h)
        setMinutes(m)
        setSeconds(s)

        onChange(`${h}:${m}:${s}`)
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                <Input
                    ref={hRef}
                    type="text"
                    value={hours}
                    onChange={handleTyping(setHours, 23, mRef)}
                    onBlur={(e) => handleBlur(e, 23, "h")}
                    className="w-14 text-center"
                    inputMode="numeric"
                />
                :
                <Input
                    ref={mRef}
                    type="text"
                    value={minutes}
                    onChange={handleTyping(setMinutes, 59, sRef)}
                    onBlur={(e) => handleBlur(e, 59, "m")}
                    className="w-14 text-center"
                    inputMode="numeric"
                />
                :
                <Input
                    ref={sRef}
                    type="text"
                    value={seconds}
                    onChange={handleTyping(setSeconds, 59)}
                    onBlur={(e) => handleBlur(e, 59, "s")}
                    className="w-14 text-center"
                    inputMode="numeric"
                />
            </div>
            <Button onClick={handleSubmit} size="sm">
                Set
            </Button>
        </div>
    )
}