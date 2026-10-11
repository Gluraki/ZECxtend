import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import type { Settings } from "@/lib/settings"

export interface MqttStatus {
    connected: boolean
    error: string | null
}

interface TimestampPayload {
    mac: string
    micros: number
}

export const connectMqtt = (settings: Settings) =>
    invoke<void>("mqtt_connect", {
        config: {
            host: settings.mqttHost,
            port: settings.mqttPort,
            topic: settings.mqttTopic,
            username: settings.mqttUsername || null,
            password: settings.mqttPassword || null,
        },
    })

export const disconnectMqtt = () => invoke<void>("mqtt_disconnect")

export const onTimestamp = (handler: (payload: TimestampPayload) => void) =>
    listen<TimestampPayload>("mqtt://timestamp", (event) => handler(event.payload))

export const onMqttStatus = (handler: (status: MqttStatus) => void) =>
    listen<MqttStatus>("mqtt://status", (event) => handler(event.payload))
