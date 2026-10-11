import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { formatClock, medianMicros } from "@/lib/timestamps"
import type { Stamp } from "@/lib/types"

interface TimestampSelectorProps {
    label: string
    stamps: Stamp[]
    selectedIds: number[]
    setSelectedIds: (ids: number[]) => void
}

export function TimestampSelector({ label, stamps, selectedIds, setSelectedIds }: TimestampSelectorProps) {
    const median = medianMicros(stamps.filter((s) => selectedIds.includes(s.id)).map((s) => s.micros))

    return (
        <div>
            <p>{label}:</p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        {median !== null ? formatClock(median) : `Select ${label}`}
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={5} align="start" className="min-w-[220px]">
                    <DropdownMenuLabel>{label}</DropdownMenuLabel>

                    {stamps.map((stamp) => {
                        const isSelected = selectedIds.includes(stamp.id)
                        return (
                            <DropdownMenuCheckboxItem
                                key={stamp.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                    setSelectedIds(
                                        checked ? [...selectedIds, stamp.id] : selectedIds.filter((id) => id !== stamp.id)
                                    )
                                }}
                                onSelect={(e) => e.preventDefault()}
                                className={`cursor-default px-2 py-1 rounded-md ${isSelected ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
                                    }`}
                            >
                                {formatClock(stamp.micros)}
                                <span className="text-muted-foreground">{stamp.mac}</span>
                            </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
