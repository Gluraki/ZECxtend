import { Edit, Trash2 } from "lucide-react"
import { IconButton } from "@/components/shared/icon-button"
import { Card, CardContent } from "@/components/ui/card"
import type { Driver } from "@/types/driver"

interface Props {
  driver: Driver
  onEdit: () => void
  onDelete: () => void
}

export function DriverCard({ driver, onEdit, onDelete }: Props) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{driver.name}</h3>
            <p className="text-sm text-muted-foreground">Weight: {driver.weight} kg</p>
          </div>
          <div className="flex gap-1">
            <IconButton icon={Edit} label="Edit driver" size="icon" onClick={onEdit} />
            <IconButton icon={Trash2} label="Delete driver" size="icon" onClick={onDelete} destructive />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
