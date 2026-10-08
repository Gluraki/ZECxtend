import { Edit, Plus, Trash2, Users } from "lucide-react"
import { useState } from "react"
import { deleteDriver, listDrivers, saveDriver } from "@/api/drivers"
import { DriverFormDialog } from "@/components/forms/driver-form-dialog"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { IconButton } from "@/components/shared/icon-button"
import { LoadingState } from "@/components/shared/loading-state"
import { TableCell, TableRow } from "@/components/ui/table"
import { useApiData } from "@/hooks/use-api-data"
import type { Driver } from "@/types/driver"

interface Props {
  teamId: number
  colSpan: number
}

export function TeamDriversRow({ teamId, colSpan }: Props) {
  const { data: drivers, loading, reload } = useApiData(() => listDrivers(teamId), [], [teamId])
  const [driverForm, setDriverForm] = useState<Driver | "new" | null>(null)
  const [deleting, setDeleting] = useState<Driver | null>(null)
  const editing = driverForm === "new" ? null : driverForm

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="bg-slate-50">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4" />
              Drivers
            </h4>
            <IconButton icon={Plus} label="Add driver" onClick={() => setDriverForm("new")} />
          </div>
          {loading ? (
            <LoadingState className="py-4" />
          ) : drivers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drivers in this team</p>
          ) : (
            <div className="space-y-2">
              {drivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                  <div>
                    <span className="font-medium">{driver.name}</span>
                    <span className="ml-3 text-sm text-muted-foreground">Weight: {driver.weight}kg</span>
                  </div>
                  <div className="flex gap-2">
                    <IconButton icon={Edit} label="Edit driver" onClick={() => setDriverForm(driver)} />
                    <IconButton icon={Trash2} label="Delete driver" onClick={() => setDeleting(driver)} destructive />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {driverForm && (
          <DriverFormDialog
            driver={editing}
            onSubmit={(data) => saveDriver(teamId, editing, data)}
            onSaved={() => {
              setDriverForm(null)
              reload()
            }}
            onClose={() => setDriverForm(null)}
          />
        )}
        {deleting && (
          <DeleteDialog
            title="Delete Driver"
            description="Are you sure you want to delete this driver?"
            successMessage="Driver deleted successfully"
            onDelete={() => deleteDriver(deleting.id)}
            onDeleted={() => {
              setDeleting(null)
              reload()
            }}
            onClose={() => setDeleting(null)}
          />
        )}
      </TableCell>
    </TableRow>
  )
}
