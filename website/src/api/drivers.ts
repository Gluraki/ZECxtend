import { MAX_LIMIT, request } from "@/api/client"
import { changedFields } from "@/lib/changed-fields"
import type { Driver, DriverCreate, DriverUpdate } from "@/types/driver"

export const listDrivers = (teamId?: number) =>
  request<Driver[]>("/drivers/", { query: { team_id: teamId, limit: MAX_LIMIT } })

export const createDriver = (data: DriverCreate) =>
  request<Driver>("/drivers/", { method: "POST", body: data })

const updateDriver = (id: number, data: DriverUpdate) =>
  request<Driver>(`/drivers/${id}`, { method: "PUT", body: data })

export const saveDriver = (teamId: number, driver: Driver | null, data: Pick<Driver, "name" | "weight">) =>
  driver ? updateDriver(driver.id, changedFields(driver, data)) : createDriver({ ...data, team_id: teamId })

export const deleteDriver = (id: number) => request<Driver>(`/drivers/${id}`, { method: "DELETE" })
