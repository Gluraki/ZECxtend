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

interface SelectionCardProps<T extends { id: number }> {
    title: string;
    items: T[];
    selectedItem: T | null;
    onSelect: (item: T | null) => void;
    getDisplayName?: (item: T) => string; // optional
}

export function SelectionCard<T extends { id: number }>({
    title,
    items,
    selectedItem,
    onSelect,
    getDisplayName = (item) => (item as any).name || String(item.id),
}: SelectionCardProps<T>) {
    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center justify-between gap-2">
                            {selectedItem ? getDisplayName(selectedItem) : `Select ${title}`}
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup
                            value={selectedItem?.id.toString() || ""}
                            onValueChange={(value) => {
                                const item = items.find((i) => i.id.toString() === value) || null;
                                onSelect(item);
                            }}
                        >
                            {items.map((item) => (
                                <DropdownMenuRadioItem key={item.id} value={item.id.toString()}>
                                    {getDisplayName(item)}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    )
}
