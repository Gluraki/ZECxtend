'use client'

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { medianTimestamp } from "@/components/medianTimestamp"

interface FormulaCardProps {
    selectedStartTimestamps: string[] | null
    selectedEndTimestamps: string[] | null
    penaltyCount: number
    selectedPenaltyAmount: number
    setSelectedStartTimestamps: (timestamps: string[] | null) => void
    setSelectedEndTimestamps: (timestamps: string[] | null) => void
}

export function FormulaCard({
    selectedStartTimestamps,
    selectedEndTimestamps,
    penaltyCount,
    selectedPenaltyAmount,
    setSelectedStartTimestamps,
    setSelectedEndTimestamps,
}: FormulaCardProps) {

    const [startMedian, setStartMedian] = useState<string | number | Date | null>(null)
    const [endMedian, setEndMedian] = useState<string | number | Date | null>(null)


    useEffect(() => {
        setStartMedian(medianTimestamp(selectedStartTimestamps ?? []))
        setEndMedian(medianTimestamp(selectedEndTimestamps ?? []))
    }, [selectedStartTimestamps, selectedEndTimestamps])


    const formatTimestampUTC = (input: string | number | Date): string => {
        const date = typeof input === "string" || typeof input === "number"
            ? new Date(input)
            : input

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

                <p>
                    Attempt time formula ={" "}
                    {formatTimestampUTC(endMedian ?? 0)} -{" "}
                    {formatTimestampUTC(startMedian ?? 0)} + ({penaltyCount} * {selectedPenaltyAmount})
                </p>

                <div className="flex flex-col gap-2 mt-4">
                    <label className="flex items-center gap-2">
                        <span>Manual Start Time:</span>
                        <TimeSplitInput
                            key={startMedian?.toString()}
                            initialTime={startMedian ?? undefined}
                            onChange={(fullTimestamp) => setSelectedStartTimestamps([fullTimestamp])}
                        />
                    </label>

                    <label className="flex items-center gap-2">
                        <span>Manual End Time:</span>
                        <TimeSplitInput
                            key={endMedian?.toString()}
                            initialTime={endMedian ?? undefined}
                            onChange={(fullTimestamp) => setSelectedEndTimestamps([fullTimestamp])}
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
    initialTime?: string | number | Date
}

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
}

function normalizeTimeUTC(value?: string | number | Date): [string, string, string] {
    if (!value) return ["00", "00", "00"]

    const d = typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : value

    return [
        String(d.getUTCHours()).padStart(2, "0"),
        String(d.getUTCMinutes()).padStart(2, "0"),
        String(d.getUTCSeconds()).padStart(2, "0"),
    ]
}

const buildUTCDateFromTime = (time: string, referenceDateISO?: string): string => {
    const [hh = 0, mm = 0, ss = 0] = time.split(":").map(Number)

    // Use reference date if provided and valid, otherwise use epoch (1970-01-01)
    let refDate = new Date(0) // default to epoch

    if (referenceDateISO) {
        const testDate = new Date(referenceDateISO)
        // Only use reference date if it's valid
        if (!isNaN(testDate.getTime())) {
            refDate = testDate
        }
    }

    const utc = new Date(Date.UTC(
        refDate.getUTCFullYear(),
        refDate.getUTCMonth(),
        refDate.getUTCDate(),
        clamp(hh, 0, 23),
        clamp(mm, 0, 59),
        clamp(ss, 0, 59),
        0
    ))

    return utc.toISOString()
}

function TimeSplitInput({ onChange, initialTime }: TimeSplitInputProps) {
    const [hours, setHours] = useState("00")
    const [minutes, setMinutes] = useState("00")
    const [seconds, setSeconds] = useState("00")

    const hRef = useRef<HTMLInputElement | null>(null)
    const mRef = useRef<HTMLInputElement | null>(null)
    const sRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        const [h, m, s] = normalizeTimeUTC(initialTime)
        setHours(h)
        setMinutes(m)
        setSeconds(s)
    }, [initialTime])

    const focusNext = (ref?: React.RefObject<HTMLInputElement | null>) => {
        ref?.current?.focus()
        ref?.current?.select()
    }

    const handleTyping = (
        setter: (v: string) => void,
        max: number,
        nextRef?: React.RefObject<HTMLInputElement | null>
    ) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const h = type === "h" ? formatted : hours
        const m = type === "m" ? formatted : minutes
        const s = type === "s" ? formatted : seconds

        const timeString = `${h}:${m}:${s}`
        // Pass initialTime as reference to maintain the same date
        onChange(buildUTCDateFromTime(timeString, initialTime?.toString()))
    }


    return (
        <div className="flex items-center gap-1">
            <Input
                ref={hRef}
                value={hours}
                onChange={handleTyping(setHours, 23, mRef)}
                onBlur={(e) => handleBlur(e, 23, "h")}
                className="w-14 text-center"
                inputMode="numeric"
            />
            <span>:</span>
            <Input
                ref={mRef}
                value={minutes}
                onChange={handleTyping(setMinutes, 59, sRef)}
                onBlur={(e) => handleBlur(e, 59, "m")}
                className="w-14 text-center"
                inputMode="numeric"
            />
            <span>:</span>
            <Input
                ref={sRef}
                value={seconds}
                onChange={handleTyping(setSeconds, 59)}
                onBlur={(e) => handleBlur(e, 59, "s")}
                className="w-14 text-center"
                inputMode="numeric"
            />
        </div>
    )
}
