import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormulaCard } from "@/components/FormulaCard"
import { SelectionCard } from "@/components/SelectionCard"
import { MacInputRow } from "@/components/MacInputRow"
import { ZECHeader } from "@/components/ZECHeader"
import { NumberInputCard } from "@/components/NumberInputCard"
import { ConnectionStatusCard } from "@/components/ConnectionStatusCard"
import { TimestampSelector } from "@/components/TimestampSelector"
import { AttemptResultCard } from "@/components/AttemptResultCard"
import { ManualAttemptTimeInput } from "@/components/ManualInput"
import { listChallenges, listDrivers, listPenaltyTypes, listTeams, updateChallengeMac } from "@/api/endpoints"
import { onMqttStatus, onTimestamp, type MqttStatus } from "@/lib/mqtt"
import { medianMicros, normalizeMac } from "@/lib/timestamps"
import type { Challenge, Driver, MacField, PenaltyType, Stamp, Team } from "@/lib/types"

interface TimingScreenProps {
  broker: string
  onDisconnect: () => void
}

const PAIRING_ROWS: { field: MacField; label: string }[] = [
  { field: "esp_mac_start1", label: "Update Start 1" },
  { field: "esp_mac_start2", label: "Update Start 2" },
  { field: "esp_mac_finish1", label: "Update Finish 1" },
  { field: "esp_mac_finish2", label: "Update Finish 2" },
]

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function TimingScreen({ broker, onDisconnect }: TimingScreenProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const [macInputs, setMacInputs] = useState<Record<MacField, string>>({
    esp_mac_start1: "",
    esp_mac_start2: "",
    esp_mac_finish1: "",
    esp_mac_finish2: "",
  });
  const [manualAttemptTime, setManualAttemptTime] = useState<string | null>(null);

  const [penalties, setPenalties] = useState<PenaltyType[]>([]);
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyType | null>(null);

  const [active, setActive] = useState(false);
  const [mqttStatus, setMqttStatus] = useState<MqttStatus>({ connected: true, error: null });

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [penaltyCount, setPenaltyCount] = useState<number>(0);
  const [energyConsumption, setEnergyConsumption] = useState<number>(0.0);

  const [stamps, setStamps] = useState<Stamp[]>([]);
  const nextStampId = useRef(0);

  const [selectedStartIds, setSelectedStartIds] = useState<number[]>([]);
  const [selectedEndIds, setSelectedEndIds] = useState<number[]>([]);

  const stampsFor = (fields: MacField[]) => {
    const macs = new Set(fields.map((f) => normalizeMac(selectedChallenge?.[f])).filter(Boolean))
    return stamps.filter((s) => macs.has(normalizeMac(s.mac)))
  }
  const startStamps = stampsFor(["esp_mac_start1", "esp_mac_start2"]);
  const endStamps = stampsFor(["esp_mac_finish1", "esp_mac_finish2"]);

  const medianOf = (list: Stamp[], ids: number[]) =>
    medianMicros(list.filter((s) => ids.includes(s.id)).map((s) => s.micros))
  const startMicros = medianOf(startStamps, selectedStartIds);
  const endMicros = medianOf(endStamps, selectedEndIds);

  // Reset function to clear all dynamic state
  const resetForm = () => {
    setStamps([]);
    setSelectedStartIds([]);
    setSelectedEndIds([]);
    setManualAttemptTime(null);
    setPenaltyCount(0);
    setEnergyConsumption(0.0);
  };

  // Fetch on mount
  useEffect(() => {
    listTeams()
      .then((data) => {
        setTeams(data);
        setSelectedTeam(data[0] ?? null);
      })
      .catch((error) => alert(`Failed to fetch teams: ${errorMessage(error)}`));

    listChallenges()
      .then((data) => {
        setChallenges(data);
        setSelectedChallenge(data[0] ?? null);
      })
      .catch((error) => alert(`Failed to fetch challenges: ${errorMessage(error)}`));

    listPenaltyTypes()
      .then((data) => {
        setPenalties(data);
        setSelectedPenalty(data[0] ?? null);
      })
      .catch((error) => alert(`Failed to fetch penalties: ${errorMessage(error)}`));
  }, []);

  // Fetch drivers for selected team
  useEffect(() => {
    if (!selectedTeam) return;

    listDrivers(selectedTeam.id)
      .then((data) => {
        setDrivers(data);
        setSelectedDriver(data[0] ?? null);
      })
      .catch((error) => alert(`Failed to fetch drivers: ${errorMessage(error)}`));
  }, [selectedTeam]);

  useEffect(() => {
    const unlisten = onMqttStatus(setMqttStatus);
    return () => void unlisten.then((stop) => stop());
  }, []);

  // Only collect timestamps while active
  useEffect(() => {
    if (!active) return;

    const unlisten = onTimestamp(({ mac, micros }) => {
      const id = nextStampId.current++;
      setStamps((prev) => [...prev, { id, mac, micros }]);
    });
    return () => void unlisten.then((stop) => stop());
  }, [active]);

  const updateMac = async (field: MacField) => {
    const mac = macInputs[field].trim();
    if (!selectedChallenge || !mac) return;

    try {
      const updated = await updateChallengeMac(selectedChallenge.id, field, mac);
      setChallenges((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedChallenge(updated);
      setMacInputs((prev) => ({ ...prev, [field]: "" }));
    } catch (error) {
      alert(`Failed to update challenge: ${errorMessage(error)}`);
    }
  };

  return (
    <div>
      <ZECHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-6">
        <SelectionCard<Challenge>
          title="Challenge"
          items={challenges}
          selectedItem={selectedChallenge}
          onSelect={setSelectedChallenge}
        />

        <SelectionCard<PenaltyType>
          title="Penalty"
          items={penalties}
          selectedItem={selectedPenalty}
          onSelect={setSelectedPenalty}
          getDisplayName={(p) => `${p.type} (${p.amount}s)`}
        />

        <ConnectionStatusCard
          active={active}
          setActive={setActive}
          broker={broker}
          mqttStatus={mqttStatus}
          onDisconnect={onDisconnect}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 mb-4 gap-6">
        <SelectionCard<Team>
          title="Team"
          items={teams}
          selectedItem={selectedTeam}
          onSelect={setSelectedTeam}
        />

        <SelectionCard<Driver>
          title="Drivers"
          items={drivers}
          selectedItem={selectedDriver}
          onSelect={setSelectedDriver}
        />

        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle>Pairing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {PAIRING_ROWS.map(({ field, label }) => (
              <MacInputRow
                key={field}
                label={label}
                value={macInputs[field]}
                placeholder={selectedChallenge?.[field] ?? undefined}
                onChange={(value) => setMacInputs((prev) => ({ ...prev, [field]: value }))}
                onUpdate={() => void updateMac(field)}
              />
            ))}
          </CardContent>
        </Card>

        <NumberInputCard
          title="Penalty Count"
          value={penaltyCount}
          onChange={(value) => setPenaltyCount(value ?? 0)}
          placeholder="Amount of Penalties"
          kind="int"
        />

        <NumberInputCard
          title="Energy Consumption"
          value={energyConsumption}
          onChange={(value) => setEnergyConsumption(value ?? 0)}
          placeholder="Energy Consumption"
          kind="float"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 mb-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TimestampSelector
              label="Start timestamp"
              stamps={startStamps}
              selectedIds={selectedStartIds}
              setSelectedIds={setSelectedStartIds}
            />

            <TimestampSelector
              label="End timestamp"
              stamps={endStamps}
              selectedIds={selectedEndIds}
              setSelectedIds={setSelectedEndIds}
            />

            <div className="flex flex-col gap-2 mt-4">
              <ManualAttemptTimeInput
                value={manualAttemptTime}
                onChange={setManualAttemptTime}
              />
            </div>
          </CardContent>
        </Card>

        <FormulaCard
          startMicros={startMicros}
          endMicros={endMicros}
          manualAttemptTime={manualAttemptTime}
          penaltyCount={penaltyCount}
          selectedPenaltyAmount={selectedPenalty?.amount ?? 0}
        />

        <AttemptResultCard
          selectedTeam={selectedTeam}
          selectedDriver={selectedDriver}
          selectedChallenge={selectedChallenge}
          startMicros={startMicros}
          endMicros={endMicros}
          manualAttemptTime={manualAttemptTime}
          energyConsumption={energyConsumption}
          selectedPenalty={selectedPenalty}
          penaltyCount={penaltyCount}
          onSubmitSuccess={resetForm}
        />
      </div>
    </div>
  );
}
