'use client'

import React, { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

/* ------------------- Helpers ------------------- */

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
}

function normalizeTimeUTC(isoString?: string): [string, string, string] {
    if (!isoString) return ["00", "00", "00"]

    if (/^\d{2}:\d{2}:\d{2}$/.test(isoString)) {
        const parts = isoString.split(":")
        return [parts[0], parts[1], parts[2]]
    }

    const d = new Date(isoString)
    return [
        String(d.getUTCHours()).padStart(2, "0"),
        String(d.getUTCMinutes()).padStart(2, "0"),
        String(d.getUTCSeconds()).padStart(2, "0"),
    ]
}

/* ------------------- TimeSplitInput ------------------- */

interface TimeSplitInputProps {
    onChange: (time: string) => void
    initialTime?: string
}

function TimeSplitInput({ onChange, initialTime }: TimeSplitInputProps) {
    const [hours, setHours] = useState(() => normalizeTimeUTC(initialTime)[0] || "00")
    const [minutes, setMinutes] = useState(() => normalizeTimeUTC(initialTime)[1] || "00")
    const [seconds, setSeconds] = useState(() => normalizeTimeUTC(initialTime)[2] || "00")

    const hRef = useRef<HTMLInputElement>(null)
    const mRef = useRef<HTMLInputElement>(null)
    const sRef = useRef<HTMLInputElement>(null)

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2)
        setHours(val)
        if (val.length === 2) {
            mRef.current?.focus()
            mRef.current?.select()
        }
    }

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2)
        setMinutes(val)
        if (val.length === 2) {
            sRef.current?.focus()
            sRef.current?.select()
        }
    }

    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2)
        setSeconds(val)
    }

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement>,
        max: number,
        type: "h" | "m" | "s"
    ) => {
        const num = clamp(Number(e.target.value || 0), 0, max)
        const formatted = String(num).padStart(2, "0")
        if (type === "h") setHours(formatted)
        else if (type === "m") setMinutes(formatted)
        else setSeconds(formatted)
    }

    const handleSubmit = () => {
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
                    onChange={handleHoursChange}
                    onBlur={(e) => handleBlur(e, 23, "h")}
                    className="w-14 text-center"
                    inputMode="numeric"
                />
                :
                <Input
                    ref={mRef}
                    type="text"
                    value={minutes}
                    onChange={handleMinutesChange}
                    onBlur={(e) => handleBlur(e, 59, "m")}
                    className="w-14 text-center"
                    inputMode="numeric"
                />
                :
                <Input
                    ref={sRef}
                    type="text"
                    value={seconds}
                    onChange={handleSecondsChange}
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

/* ------------------- ManualAttemptTimeInput ------------------- */

interface ManualAttemptTimeInputProps {
    value: string | null
    onChange: (timestamp: string | null) => void
}

export function ManualAttemptTimeInput({ value, onChange }: ManualAttemptTimeInputProps) {
    return (
        <div className="flex flex-col gap-2">
            <p>Manual Attempt Time:</p>
            <TimeSplitInput
                key={value?.toString()}
                initialTime={value ?? undefined}
                onChange={(fullTimestamp) => onChange(fullTimestamp)}
            />
        </div>
    )
}