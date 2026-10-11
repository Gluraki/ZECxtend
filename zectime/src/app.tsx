import { useEffect, useState } from "react"
import { ConnectScreen } from "@/components/ConnectScreen"
import { TimingScreen } from "@/components/TimingScreen"
import { disconnectMqtt } from "@/lib/mqtt"
import { loadSettings, type Settings } from "@/lib/settings"

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    void loadSettings().then(setSettings)
  }, [])

  if (!settings) return null

  if (!connected) {
    return (
      <ConnectScreen
        initialSettings={settings}
        onConnected={(next) => {
          setSettings(next)
          setConnected(true)
        }}
      />
    )
  }

  return (
    <TimingScreen
      broker={`${settings.mqttHost}:${settings.mqttPort}`}
      onDisconnect={() => {
        void disconnectMqtt()
        setConnected(false)
      }}
    />
  )
}
