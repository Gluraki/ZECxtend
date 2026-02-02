export interface Team {
    id: number;
    name: string;
}

export interface Challenge {
    id: number;
    name: string;
    esp_mac_start1: string;
    esp_mac_start2: string;
    esp_mac_finish1: string;
    esp_mac_finish2: string;
}

export interface Penalty {
    id: number;
    amount: number;
    type: string | null;
}

export interface ConnectionStatus {
    is_active: boolean;
}

export interface Driver {
    id: number;
    name: string;
}

export interface Attempt {
    team_id: number
    driver_id: number
    challenge_id: number
    start_time: string
    end_time: string
    energy_used: number
    penalty_id: number
    penalty_count: number
}