export interface Team {
    id: number
    name: string
}

export interface Driver {
    id: number
    name: string
    team_id: number
}

export type MacField = "esp_mac_start1" | "esp_mac_start2" | "esp_mac_finish1" | "esp_mac_finish2"

export type Challenge = {
    id: number
    name: string
} & Record<MacField, string | null>

export interface PenaltyType {
    id: number
    type: string
    amount: number
}

export interface AttemptCreate {
    team_id: number
    driver_id: number
    challenge_id: number
    start_time: string
    end_time: string
    energy_used: number
    penalty_type: number | null
    penalty_count: number
}

/** A timestamp received over MQTT; `micros` is the ESP's wall-clock time in µs since epoch. */
export interface Stamp {
    id: number
    mac: string
    micros: number
}
