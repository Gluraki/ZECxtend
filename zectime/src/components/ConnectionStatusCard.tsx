import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { MqttStatus } from "@/lib/mqtt"

interface ConnectionStatusCardProps {
    active: boolean
    setActive: (active: boolean) => void
    broker: string
    mqttStatus: MqttStatus
    onDisconnect: () => void
}

export function ConnectionStatusCard({ active, setActive, broker, mqttStatus, onDisconnect }: ConnectionStatusCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={active ? "text-green-600" : "text-red-600"}>
                    Status: {active ? "Active" : "Inactive"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 space-x-3">
                <Button
                    onClick={() => setActive(true)}
                    className="bg-green-600 hover:bg-green-700 text-white text-2xl px-6 py-3"
                >
                    Activate
                </Button>

                <Button
                    onClick={() => setActive(false)}
                    className="bg-red-600 hover:bg-red-700 text-white text-2xl px-6 py-3"
                >
                    Deactivate
                </Button>

                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                        MQTT {broker}:{" "}
                        {mqttStatus.connected ? (
                            <span className="text-green-600">connected</span>
                        ) : (
                            <span className="text-red-600">reconnecting ({mqttStatus.error})</span>
                        )}
                    </p>
                    <Button variant="outline" size="sm" onClick={onDisconnect}>
                        Disconnect
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
