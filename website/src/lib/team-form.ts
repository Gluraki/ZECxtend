import type { Team, TeamCategory, TeamCreate } from "@/types/team"

export interface TeamFormValues {
  name: string
  category: TeamCategory
  vehicle_weight: number | null
  mean_power: number | null
  rfid_identifier: string
}

export const EMPTY_TEAM_FORM: TeamFormValues = {
  name: "",
  category: "close_to_series",
  vehicle_weight: null,
  mean_power: null,
  rfid_identifier: "",
}

export function teamFormFrom(team: Team): TeamFormValues {
  return {
    name: team.name,
    category: team.category,
    vehicle_weight: team.vehicle_weight,
    mean_power: team.mean_power,
    rfid_identifier: team.rfid_identifier,
  }
}

export function teamPayload(values: TeamFormValues): TeamCreate {
  if (!values.name.trim() || !values.rfid_identifier.trim()) {
    throw new Error("Team name and RFID identifier are required")
  }
  if (!values.vehicle_weight || !values.mean_power) {
    throw new Error("Vehicle weight and mean power must be greater than 0")
  }
  return {
    name: values.name.trim(),
    category: values.category,
    vehicle_weight: values.vehicle_weight,
    mean_power: values.mean_power,
    rfid_identifier: values.rfid_identifier.trim(),
  }
}
