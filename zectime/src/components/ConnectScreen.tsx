import { useState, type FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ZECHeader } from "@/components/ZECHeader"
import { configureApi } from "@/api/client"
import { listTeams } from "@/api/endpoints"
import { connectMqtt } from "@/lib/mqtt"
import { saveSettings, type Settings } from "@/lib/settings"

interface ConnectScreenProps {
    initialSettings: Settings
    onConnected: (settings: Settings) => void
}

type TextField = Exclude<keyof Settings, "mqttPort">

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function ConnectScreen({ initialSettings, onConnected }: ConnectScreenProps) {
    const [settings, setSettings] = useState(initialSettings)
    const [connecting, setConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const field = (key: TextField, label: string, type = "text") => (
        <div className="flex flex-col gap-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
                id={key}
                type={type}
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            />
        </div>
    )

    const connect = async (e: FormEvent) => {
        e.preventDefault()
        setConnecting(true)
        setError(null)

        try {
            await saveSettings(settings)

            configureApi({ url: settings.apiUrl, key: settings.apiKey })
            try {
                await listTeams()
            } catch (err) {
                throw new Error(`API: ${errorMessage(err)}`)
            }

            try {
                await connectMqtt(settings)
            } catch (err) {
                throw new Error(`MQTT: ${errorMessage(err)}`)
            }

            onConnected(settings)
        } catch (err) {
            setError(errorMessage(err))
        } finally {
            setConnecting(false)
        }
    }

    return (
        <div>
            <ZECHeader />

            <Card className="mx-auto max-w-xl">
                <CardHeader>
                    <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-6" onSubmit={(e) => void connect(e)}>
                        <div className="flex flex-col gap-4">
                            <p className="font-medium">API</p>
                            {field("apiUrl", "API URL")}
                            {field("apiKey", "API Key", "password")}
                        </div>

                        <div className="flex flex-col gap-4">
                            <p className="font-medium">MQTT Broker</p>
                            <div className="grid grid-cols-[1fr_8rem] gap-4">
                                {field("mqttHost", "Host")}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="mqttPort">Port</Label>
                                    <Input
                                        id="mqttPort"
                                        type="number"
                                        min={1}
                                        max={65535}
                                        value={settings.mqttPort}
                                        onChange={(e) => setSettings({ ...settings, mqttPort: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            {field("mqttTopic", "Topic")}
                            <div className="grid grid-cols-2 gap-4">
                                {field("mqttUsername", "Username (optional)")}
                                {field("mqttPassword", "Password (optional)", "password")}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" disabled={connecting}>
                            {connecting ? "Connecting..." : "Connect"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
