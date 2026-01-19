'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface Item {
    id: number
    name: string
}

interface SelectionCardProps {
    title: string
    items: Item[]
    selectedItem: Item | null
    onSelect: (item: Item | null) => void
}

export function SelectionCard({ title, items, selectedItem, onSelect }: SelectionCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center justify-between gap-2">
                            {selectedItem ? selectedItem.name : `Select ${title}`}
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup
                            value={selectedItem?.id.toString() || ""}
                            onValueChange={(value) => {
                                const item = items.find((i) => i.id.toString() === value) || null
                                onSelect(item)
                            }}
                        >
                            {items.map((item) => (
                                <DropdownMenuRadioItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    )
}
