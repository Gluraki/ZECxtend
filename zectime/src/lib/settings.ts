import { LazyStore } from "@tauri-apps/plugin-store"

export interface Settings {
    apiUrl: string
    apiKey: string
    mqttHost: string
    mqttPort: number
    mqttTopic: string
    mqttUsername: string
    mqttPassword: string
}

const DEFAULT_SETTINGS: Settings = {
    apiUrl: "http://localhost",
    apiKey: "",
    mqttHost: "localhost",
    mqttPort: 1883,
    mqttTopic: "#",
    mqttUsername: "",
    mqttPassword: "",
}

const SETTINGS_KEY = "settings"

const store = new LazyStore("settings.json")

export async function loadSettings(): Promise<Settings> {
    const saved = await store.get<Partial<Settings>>(SETTINGS_KEY)
    return { ...DEFAULT_SETTINGS, ...saved }
}

export async function saveSettings(settings: Settings) {
    await store.set(SETTINGS_KEY, settings)
    await store.save()
}
