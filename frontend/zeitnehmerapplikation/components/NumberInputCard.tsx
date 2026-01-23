'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface NumberInputCardProps {
    title: string
    value: number | null
    onChange: (value: number | null) => void
    placeholder?: string
}

export function NumberInputCard({ title, value, onChange, placeholder }: NumberInputCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 space-x-3">
                <Input
                    type="number"
                    value={value ?? ""}
                    onChange={(e) => {
                        const val = e.target.value
                        onChange(val === "" ? null : Number(val))
                    }}
                    placeholder={placeholder || title}
                />
            </CardContent>
        </Card>
    )
}
