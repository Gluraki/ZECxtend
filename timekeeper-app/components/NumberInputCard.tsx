'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface NumberInputCardProps {
    title: string
    value: number | null
    onChange: (value: number | null) => void
    placeholder?: string
    kind?: "int" | "float"
}


export function NumberInputCard({
    title,
    value,
    onChange,
    placeholder,
    kind = "float",   // default
}: NumberInputCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 space-x-3">
                <Input
                    type="number"
                    step={kind === "int" ? "1" : "any"}
                    inputMode={kind === "int" ? "numeric" : "decimal"}
                    value={value ?? ""}
                    onChange={(e) => {
                        const raw = e.target.value
                        if (raw === "") {
                            onChange(null)
                            return
                        }

                        const num =
                            kind === "int" ? parseInt(raw, 10) : Number(raw)

                        onChange(Number.isNaN(num) ? null : num)
                    }}
                    placeholder={placeholder || title}
                />
            </CardContent>
        </Card>
    )
}
