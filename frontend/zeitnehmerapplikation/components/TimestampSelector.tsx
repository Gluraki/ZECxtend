'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface TimestampSelectorProps {
    label: string
    timestamps: string[]
    selectedTimestamps: string[]
    setSelectedTimestamps: React.Dispatch<React.SetStateAction<string[] | null>>
}


export function TimestampSelector({
    label,
    timestamps,
    selectedTimestamps,
    setSelectedTimestamps,
}: TimestampSelectorProps) {
    const medianTimestampISO = (timestamps: string[]): string => {
        if (!timestamps || timestamps.length === 0) return ""

        const sorted = timestamps.slice().sort()
        const mid = Math.floor(sorted.length / 2)
        let medianMs: number

        if (sorted.length % 2 === 0) {
            const mid1 = new Date(sorted[mid - 1]).getTime()
            const mid2 = new Date(sorted[mid]).getTime()
            medianMs = (mid1 + mid2) / 2
        } else {
            medianMs = new Date(sorted[mid]).getTime()
        }

        return new Date(medianMs).toISOString()
    }

    return (
        <div>
            <p>{label}:</p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        {selectedTimestamps?.length
                            ? medianTimestampISO(selectedTimestamps)
                            : `Select ${label}`}
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={5} align="start" className="min-w-[220px]">
                    <DropdownMenuLabel>{label}</DropdownMenuLabel>

                    {timestamps.map((timestamp, index) => {
                        const isSelected = selectedTimestamps?.includes(timestamp)
                        return (
                            <DropdownMenuCheckboxItem
                                key={index}
                                checked={isSelected || false}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedTimestamps((prev) =>
                                            prev ? [...prev, timestamp] : [timestamp]
                                        )
                                    } else {
                                        setSelectedTimestamps((prev) =>
                                            prev ? prev.filter((t) => t !== timestamp) : []
                                        )
                                    }
                                }}
                                onSelect={(e) => e.preventDefault()}
                                className={`cursor-default px-2 py-1 rounded-md ${isSelected ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
                                    }`}
                            >
                                {timestamp}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
