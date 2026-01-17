'use client'

import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";

import { SERVER_API_URL, MQTT_WORKER_API_URL } from "@/next.config";
import { DropdownMenuCheckboxItem, DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Team {
  id: number;
  name: string;
}

interface Challenge {
  id: number;
  name: string;
  esp_mac_start1: string;
  esp_mac_start2: string;
  esp_mac_finish1: string;
  esp_mac_finish2: string;
}

interface Penalty {
  id: number;
  amount: number;
  type: string | null;
}

interface ConnectionStatus {
  is_active: boolean;
}

interface Driver {
  id: number;
  name: string;
}

interface Attempt {
  team_id: number;
  driver_id: number;
  challenge_id: number;
  attempt_number: number;
  start_time: Date;
  end_time: Date;
  energy_used: number;
  penalty_id: number;
  penalty_count: number;
}

export default function Page() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const [espStart1Input, setEspStart1Input] = useState("");
  const [espStart2Input, setEspStart2Input] = useState("");
  const [espFinish1Input, setEspFinish1Input] = useState("");
  const [espFinish2Input, setEspFinish2Input] = useState("");

  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    is_active: false,
  });

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [attemptNr, setAttemptNr] = useState<number | null>(null);
  const [penaltyCount, setpenaltyCount] = useState<number | null>(null);
  const [energyConsumption, setEnergyConsumption] = useState<number | null>(null);

  const [startTimestamps, setStartTimestamps] = useState<string[]>([]);
  const [endTimestamps, setEndTimestamps] = useState<string[]>([]);

  const [selectedStartTimestamps, setSelectedStartTimestamps] = useState<string[]>([]);
  const [selectedEndTimestamps, setSelectedEndTimestamps] = useState<string[]>([]);

  const [manualStartTime, setManualStartTime] = useState<string>(""); // ISO string
  const [manualEndTime, setManualEndTime] = useState<string>("");

  const HOUR_IN_MS = 3600000; // 1 hour offset correction

  // Fetch Teams
  const fetchTeams = async () => {
    try {
      const response = await axios.get<Team[]>(`${SERVER_API_URL}/teams/`);
      setTeams(response.data);
      if (response.data.length > 0) setSelectedTeam(response.data[0]);
    } catch (error) {
      console.error("Failed to fetch teams", error);
    }
  };

  // Fetch Challenges
  const fetchChallenges = async () => {
    try {
      const response = await axios.get<Challenge[]>(`${SERVER_API_URL}/challenges/`);
      setChallenges(response.data);
      if (response.data.length > 0) setSelectedChallenge(response.data[0]);
    } catch (error) {
      console.error("Failed to fetch challenges", error);
    }
  };

  // Fetch Penalties
  const fetchPenalties = async () => {
    try {
      const response = await axios.get<Penalty[]>(`${SERVER_API_URL}/penalties/`);
      setPenalties(response.data);
      if (response.data.length > 0) setSelectedPenalty(response.data[0]);
    } catch (error) {
      console.error("Failed to fetch penalties", error);
    }
  };

  // Fetch Drivers for selected team
  const fetchDriversForTeam = async (teamId: number | undefined) => {
    if (!teamId) return;
    try {
      const response = await axios.get<Driver[]>(`${SERVER_API_URL}/drivers/${teamId}`);
      setDrivers(response.data);
      if (response.data.length > 0) setSelectedDriver(response.data[0]);
    } catch (error) {
      console.error("Failed to fetch drivers", error);
    }
  };

  // Fetch timestamps
  const fetchStartTimestamps = async () => {
    if (!selectedChallenge) return;
    try {
      const start_1 = await axios.get<{ timestamp: string[] }>(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge.esp_mac_start1}`);
      const start_2 = await axios.get<{ timestamp: string[] }>(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge.esp_mac_start2}`);
      const combined = [...(start_1.data.timestamp || []), ...(start_2.data.timestamp || [])];
      setStartTimestamps(combined);
    } catch (error) {
      console.error("Failed to fetch start timestamps", error);
    }
  };

  const fetchEndTimestamps = async () => {
    if (!selectedChallenge) return;
    try {
      const end_1 = await axios.get<{ timestamp: string[] }>(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge.esp_mac_finish1}`);
      const end_2 = await axios.get<{ timestamp: string[] }>(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge.esp_mac_finish2}`);
      const combined = [...(end_1.data.timestamp || []), ...(end_2.data.timestamp || [])];
      setEndTimestamps(combined);
    } catch (error) {
      console.error("Failed to fetch end timestamps", error);
    }
  };

  const medianTimestampISO = (timestamps: string[]): string => {
    if (!timestamps || timestamps.length === 0) return "";

    // Sort timestamps
    const sorted = timestamps.slice().sort();
    const mid = Math.floor(sorted.length / 2);

    let medianMs: number;

    if (sorted.length % 2 === 0) {
      const mid1 = new Date(sorted[mid - 1]).getTime() - HOUR_IN_MS;
      const mid2 = new Date(sorted[mid]).getTime() - HOUR_IN_MS;
      medianMs = (mid1 + mid2) / 2;
    } else {
      medianMs = new Date(sorted[mid]).getTime() - HOUR_IN_MS;
    }

    return new Date(medianMs).toISOString(); // <- ISO format
  };

  const formatTimestampHH_MM_SS_MMMM = (input: string | number | Date): string => {
    const date = typeof input === "string" || typeof input === "number" ? new Date(input) : input;

    // USE LOCAL TIME
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0"); // 3 digits is enough

    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  };

  const medianTimestamp = (timestamps: string[]): number => {
    if (!timestamps || timestamps.length === 0) return 0;
    const sorted = timestamps.slice().sort();
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      const mid1 = new Date(sorted[mid - 1]).getTime() - HOUR_IN_MS;
      const mid2 = new Date(sorted[mid]).getTime() - HOUR_IN_MS;
      return (mid1 + mid2) / 2;
    }
    return new Date(sorted[mid]).getTime() - HOUR_IN_MS;
  };

  const addTodayDateToTime = (time: string): string => {
    const now = new Date();
    const [hh, mm, ss = "00"] = time.split(":");
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now
      .getDate()
      .toString()
      .padStart(2, "0")}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:${ss.padStart(2, "0")}.000`;
  };


  const calcAttemptTime = (): string => {
    const startMs = medianTimestamp(selectedStartTimestamps ?? []);
    const endMs = medianTimestamp(selectedEndTimestamps ?? []);
    const penaltyMs = ((penaltyCount ?? 0) * (selectedPenalty?.amount ?? 0)) * 1000; // convert to ms

    const attemptMs = endMs - startMs + penaltyMs;

    // Format duration directly from milliseconds
    const hours = Math.floor(attemptMs / 3600000);
    const minutes = Math.floor((attemptMs % 3600000) / 60000);
    const seconds = Math.floor((attemptMs % 60000) / 1000);
    const milliseconds = attemptMs % 1000;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
  };

  const createAttempt = () => {
    if (!selectedTeam?.id) {
      alert("Please select a team!");
      return null;
    }
    if (!selectedDriver?.id) {
      alert("Please select a driver!");
      return null;
    }
    if (!selectedChallenge?.id) {
      alert("Please select a challenge!");
      return null;
    }
    if (!attemptNr || attemptNr <= 0) {
      alert("Please enter a valid attempt number!");
      return null;
    }
    if (!selectedStartTimestamps?.length) {
      alert("Please select at least one start timestamp!");
      return null;
    }
    if (!selectedEndTimestamps?.length) {
      alert("Please select at least one end timestamp!");
      return null;
    }
    if (!energyConsumption || energyConsumption <= 0) {
      alert("Please enter energy consumption!");
      return null;
    }

    if (!selectedPenalty?.type) {
      alert("Please select a penalty!");
      return null;
    }

    // Create the Attempt object
    const attempt: Attempt = {
      team_id: selectedTeam.id,
      driver_id: selectedDriver.id,
      challenge_id: selectedChallenge.id,
      attempt_number: attemptNr,
      start_time: new Date(medianTimestamp(selectedStartTimestamps)), // convert ms → Date
      end_time: new Date(medianTimestamp(selectedEndTimestamps)),     // convert ms → Date
      energy_used: energyConsumption,
      penalty_id: selectedPenalty?.id,
      penalty_count: penaltyCount ?? 0,
    };

    axios.post(`${SERVER_API_URL}/attempts/`, attempt)
      .then(() => {
        alert("Attempt submitted successfully!");
      })
      .catch((error) => {
        console.error("Failed to submit attempt", error);
        alert("Failed to submit attempt!");
      });
  }


  // Fetch on mount
  useEffect(() => {
    fetchTeams();
    fetchChallenges();
    fetchPenalties();
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    fetchDriversForTeam(selectedTeam.id);
  }, [selectedTeam]);

  useEffect(() => {
    if (!connectionStatus.is_active) return;

    fetchStartTimestamps();
    fetchEndTimestamps();

    const interval = setInterval(() => {
      fetchStartTimestamps();
      fetchEndTimestamps();
    }, 3000);

    return () => clearInterval(interval);
  }, [connectionStatus.is_active, selectedChallenge]);

  return (
    <div>
      <header className="mt-4 mb-8 px-4 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <img
            src="/images/Logo_HTL_100.png"
            alt="HTL Logo"
            className="h-16 md:h-20 object-contain"
          />
        </div>
        <h1 className="text-center text-xl md:text-5xl font-bold tracking-tight text-blue-900">
          ZEC-Timing
        </h1>
        <div className="flex justify-end">
          <img
            src="/images/ZEC-Logo.png"
            alt="Zero Emission Challenge Logo"
            className="h-16 md:h-20 object-contain"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-6">
        {/* Challenge */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center justify-between gap-2">
                  {selectedChallenge ? selectedChallenge.name : "Select Challenge"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={selectedChallenge?.id.toString() || ""}
                  onValueChange={(value) => {
                    const challenge = challenges.find((c) => c.id.toString() === value) || null;
                    setSelectedChallenge(challenge);
                  }}
                >
                  {challenges.map((challenge) => (
                    <DropdownMenuRadioItem
                      key={challenge.id}
                      value={challenge.id.toString()}
                    >
                      {challenge.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedTeam ? selectedTeam.name : "Select Team"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={selectedTeam?.id.toString() || ""}
                  onValueChange={(value) => {
                    const team = teams.find((t) => t.id.toString() === value) || null;
                    setSelectedTeam(team);
                    fetchDriversForTeam(selectedTeam?.id);
                  }}
                >
                  {teams.map((team) => (
                    <DropdownMenuRadioItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        {/*Pairing*/}
        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle>Pairing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/*Start 1*/}
            <div className="flex items-center gap-2 mt-4">
              <Input
                value={espStart1Input}
                onChange={(e) => setEspStart1Input(e.target.value)}
                placeholder={selectedChallenge?.esp_mac_start1}
              />
              <Button
                onClick={() => {
                  if (selectedChallenge) {
                    setSelectedChallenge({
                      ...selectedChallenge,
                      esp_mac_start1: espStart1Input, // update the property
                    });
                    setEspStart1Input(""); // optionally clear the input
                  }
                }}
              >
                Update Start 1
              </Button>
            </div>
            {/*Start 2*/}
            <div className="flex items-center gap-2 mt-4">
              <Input
                value={espStart2Input}
                onChange={(e) => setEspStart2Input(e.target.value)}
                placeholder={selectedChallenge?.esp_mac_start2}
              />
              <Button
                onClick={() => {
                  if (selectedChallenge) {
                    setSelectedChallenge({
                      ...selectedChallenge,
                      esp_mac_start2: espStart2Input, // update the property
                    });
                    setEspStart2Input(""); // optionally clear the input
                  }
                }}
              >
                Update Start 2
              </Button>
            </div>
            {/*Finish 1*/}
            <div className="flex items-center gap-2 mt-4">
              <Input
                value={espFinish1Input}
                onChange={(e) => setEspFinish1Input(e.target.value)}
                placeholder={selectedChallenge?.esp_mac_finish1}
              />
              <Button
                onClick={() => {
                  if (selectedChallenge) {
                    setSelectedChallenge({
                      ...selectedChallenge,
                      esp_mac_finish1: espFinish1Input, // update the property
                    });
                    setEspFinish1Input(""); // optionally clear the input
                  }
                }}
              >
                Update Finish 1
              </Button>
            </div>
            {/*Finish 2*/}
            <div className="flex items-center gap-2 mt-4">
              <Input
                value={espFinish2Input}
                onChange={(e) => setEspFinish2Input(e.target.value)}
                placeholder={selectedChallenge?.esp_mac_finish2}
              />
              <Button
                onClick={() => {
                  if (selectedChallenge) {
                    setSelectedChallenge({
                      ...selectedChallenge,
                      esp_mac_finish2: espFinish2Input, // update the property
                    });
                    setEspFinish2Input(""); // optionally clear the input
                  }
                }}
              >
                Update Finish 2
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Penalty */}
        <Card>
          <CardHeader>
            <CardTitle>Penalty</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedPenalty ? selectedPenalty.type : "Select Penalty"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={selectedPenalty?.id.toString() || ""}
                  onValueChange={(value) => {
                    const penalty = penalties.find((p) => p.id.toString() === value) || null;
                    setSelectedPenalty(penalty);
                  }}
                >
                  {penalties.map((penalty) => (
                    <DropdownMenuRadioItem key={penalty.id} value={penalty.id.toString()}>
                      {penalty.type}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <p> = {selectedPenalty?.amount} seconds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle
              className={
                connectionStatus.is_active
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              Status: {connectionStatus.is_active ? "Active" : "Inactive"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 space-x-3">
            <Button
              onClick={() => setConnectionStatus({ is_active: true })}
              className="bg-green-600 hover:bg-green-700 text-white text-2xl px-6 py-3"
            >
              Activate
            </Button>

            <Button
              onClick={() => setConnectionStatus({ is_active: false })}
              className="bg-red-600 hover:bg-red-700 text-white text-2xl px-6 py-3"
            >
              Deactivate
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 mb-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Attempt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 space-x-3">
            <Input
              type="number"
              value={attemptNr ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setAttemptNr(value === "" ? null : Number(value));
              }}
              placeholder="Attempt Number"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Penalty Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 space-x-3">
            <Input
              type="number"
              value={penaltyCount ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setpenaltyCount(value === "" ? null : Number(value));
              }}
              placeholder="Amount of Penalties"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedDriver ? selectedDriver.name : "Select Driver"}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={selectedDriver?.id.toString() || ""}
                  onValueChange={(value) => {
                    const driver = drivers.find((d) => d.id.toString() === value) || null;
                    setSelectedDriver(driver);
                  }}
                >
                  {drivers.map((driver) => (
                    <DropdownMenuRadioItem key={driver.id} value={driver.id.toString()}>
                      {driver.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Energy Consumption
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 space-x-3">
            <Input
              type="number"
              value={energyConsumption ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setEnergyConsumption(value === "" ? null : Number(value));
              }}
              placeholder="Energy Consumption"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 mb-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Start Timestamps */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {selectedStartTimestamps?.length
                      ? medianTimestampISO(selectedStartTimestamps)
                      : "Select Start Timestamps"}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  sideOffset={5}
                  align="start"
                  className="min-w-[220px]"
                >
                  <DropdownMenuLabel>Start Timestamps</DropdownMenuLabel>

                  {startTimestamps?.map((timestamp, index) => {
                    const isSelected = selectedStartTimestamps?.includes(timestamp);
                    return (
                      <DropdownMenuCheckboxItem
                        key={index}
                        checked={isSelected || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStartTimestamps((prev) =>
                              prev ? [...prev, timestamp] : [timestamp]
                            );
                          } else {
                            setSelectedStartTimestamps((prev) =>
                              prev ? prev.filter((t) => t !== timestamp) : []
                            );
                          }
                        }}
                        onSelect={(e) => e.preventDefault()}
                        className={`cursor-default px-2 py-1 rounded-md ${isSelected ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
                          }`}
                      >
                        {timestamp}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* End Timestamps */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {selectedEndTimestamps?.length
                      ? medianTimestampISO(selectedEndTimestamps)
                      : "Select End Timestamps"}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  sideOffset={5}
                  align="start"
                  className="min-w-[220px]"
                >
                  <DropdownMenuLabel>End Timestamps</DropdownMenuLabel>

                  {endTimestamps?.map((timestamp, index) => {
                    const isSelected = selectedEndTimestamps?.includes(timestamp);
                    return (
                      <DropdownMenuCheckboxItem
                        key={index}
                        checked={isSelected || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEndTimestamps((prev) =>
                              prev ? [...prev, timestamp] : [timestamp]
                            );
                          } else {
                            setSelectedEndTimestamps((prev) =>
                              prev ? prev.filter((t) => t !== timestamp) : []
                            );
                          }
                        }}
                        onSelect={(e) => e.preventDefault()}
                        className={`cursor-default px-2 py-1 rounded-md ${isSelected ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
                          }`}
                      >
                        {timestamp}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Formula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Attempt time formula = end time - start time + (amount of penalties * time penalty)
            </p>

            <p>
              Attempt time formula ={" "}
              {formatTimestampHH_MM_SS_MMMM(medianTimestamp(selectedEndTimestamps ?? []))} -
              {formatTimestampHH_MM_SS_MMMM(medianTimestamp(selectedStartTimestamps ?? []))} + ( {penaltyCount ?? 0} * {(selectedPenalty?.amount ?? 0)})
            </p>

            <div className="flex flex-col gap-2 mt-4">
              {/* Manual Start Time */}
              <label className="flex items-center gap-2">
                <span>Manual Start Time:</span>
                <input
                  type="time"
                  step={1}
                  value={medianTimestamp(selectedStartTimestamps)}
                  onChange={(e) => {
                    const fullTimestamp = addTodayDateToTime(e.target.value)
                    setSelectedStartTimestamps([fullTimestamp])
                  }}
                  className="border rounded p-1 w-56"
                />
              </label>

              {/* Manual End Time */}
              <label className="flex items-center gap-2">
                <span>Manual End Time:</span>
                <input
                  type="time"
                  step={1}
                  value={medianTimestamp(selectedEndTimestamps)}
                  onChange={(e) => {
                    const fullTimestamp = addTodayDateToTime(e.target.value)
                    setSelectedEndTimestamps([fullTimestamp])
                  }}
                  className="border rounded p-1 w-56"
                />
              </label>
            </div>

          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>
              Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Result = {calcAttemptTime()}
            </p>

            <Button variant={"outline"} onClick={
              () => createAttempt()
            }>
              Submit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

