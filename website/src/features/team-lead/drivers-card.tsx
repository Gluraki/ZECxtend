import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DriverCard } from "@/features/team-lead/driver-card"
import type { Driver } from "@/types/driver"

interface Props {
  drivers: Driver[]
  onAdd: () => void
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

export function DriversCard({ drivers, onAdd, onEdit, onDelete }: Props) {
  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="h-6 w-6" />
          Team Drivers
        </CardTitle>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No drivers yet</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onEdit={() => onEdit(driver)}
                onDelete={() => onDelete(driver)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
