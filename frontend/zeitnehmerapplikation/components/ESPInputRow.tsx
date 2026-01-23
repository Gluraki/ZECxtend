'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ESP Input Row (Start/Finish updates)
interface ESPInputRowProps {
    label: string;
    value: string;
    placeholder: string;
    onChange: (val: string) => void;
    onUpdate: () => void;
}
export function ESPInputRow({ label, value, placeholder, onChange, onUpdate }: ESPInputRowProps) {
    return (
        <div className="flex items-center gap-2 mt-4">
            <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
            <Button onClick={onUpdate}>{label}</Button>
        </div>
    )
}