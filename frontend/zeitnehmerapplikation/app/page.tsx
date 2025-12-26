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

interface Pentalty {
  id: number;
  amount: number;
  type: String | null;
}

interface ConnectionStatus {
  is_active: boolean;
}

interface Drivers {
  id: number;
  name: String;
}

interface Attempt {
  team_id: number;
  driver_id: number;
  challenge_id: number;
  attempt_number: number;
  start_time: Date;
  end_time: Date;
  energy_used: number;
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

  const [penalties, setPenalties] = useState<Pentalty[]>([]);
  const [selectedPenalty, setSelectedPenalty] = useState<Pentalty | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    is_active: false,
  });

  const [drivers, setDrivers] = useState<Drivers[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Drivers | null>(null);

  const [attemptNr, setAttemptNr] = useState<number | null>(null);
  const [penaltyAmount, setPenaltyAmount] = useState<number | null>(null);
  const [energyConsumption, setEnergyConsumption] = useState<number | null>(null);

  const [startTimestamps, setStartTimestamps] = useState<String[] | null>([]);
  const [endTimestamps, setEndTimestamps] = useState<String[] | null>([]);

  const [attempt, setAttempt] = useState<Attempt | null>(null);

  const [selectedStartTimestamps, setSelectedStartTimestamps] = useState<String[] | null>(null);
  const [selectedEndTimestamps, setSelectedEndTimestamps] = useState<String[] | null>(null);

  const [medianStartTimestamp, setMedianStartTimestamp] = useState<String | null>(null);
  const [medianEndTimestamp, setMedianEndTimestamp] = useState<String | null>(null);

  const [attemptTime, setAttemptTime] = useState<string | null>(null);
  const [attemptTimeWithPenalty, setAttemptTimeWithPenalty] = useState<string | null>(null);


  // Fetch Teams
  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${SERVER_API_URL}/teams/`);
      setTeams(response.data);

      if (response.data.length > 0) {
        setSelectedTeam(response.data[0]); // default first team
      }
    } catch (error) {
      console.error("Failed to fetch teams", error);
    }
  };

  // Fetch Challenges
  const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${SERVER_API_URL}/challenges/`);
      setChallenges(response.data);

      if (response.data.length > 0) {
        setSelectedChallenge(response.data[0]); // default first challenge
      }
    } catch (error) {
      console.error("Failed to fetch challenges", error);
    }
  };

  const fetchPenalties = async () => {
    try {
      const response = await axios.get(`${SERVER_API_URL}/penalties/`);
      setPenalties(response.data);

      if (response.data.length > 0) {
        setSelectedPenalty(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch penalties", error);
    }
  }

  const fetchDriversForTeam = async () => {
    try {
      const response = await axios.get(`${SERVER_API_URL}/drivers/${selectedTeam?.id}`)
      setDrivers(response.data)

      if (response.data.length > 0) {
        setSelectedDriver(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch penalties", error);
    }
  }

  const fetchStartTimestamps = async () => {
    try {
      const start_1 = await axios.get(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge?.esp_mac_start1}`)
      const start_2 = await axios.get(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge?.esp_mac_start2}`)

      const start_timestamps = [
        ...(start_1.data.timestamp || []),
        ...(start_2.data.timestamp || []),
      ];

      setStartTimestamps(start_timestamps);
    } catch (error) {
      console.error("Failed to fetch penalties", error);
    }
  }

  const fetchEndTimestamps = async () => {
    try {
      const end_1 = await axios.get(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge?.esp_mac_finish1}`)
      const end_2 = await axios.get(`${MQTT_WORKER_API_URL}/timestamps/${selectedChallenge?.esp_mac_finish2}`)

      const end_timestamps = [
        ...(end_1.data.timestamp || []),
        ...(end_2.data.timestamp || []),
      ];

      setEndTimestamps(end_timestamps);
    } catch (error) {
      console.error("Failed to fetch penalties", error);
    }
  }

  // Remove setState from medianTimestamp
  const medianTimestamp = (timestamps: string[] | null): string | null => {
    if (!timestamps || timestamps.length === 0) return null;

    const sorted = timestamps.slice().sort();
    const midIndex = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      const mid1 = new Date(sorted[midIndex - 1]).getTime();
      const mid2 = new Date(sorted[midIndex]).getTime();
      return new Date((mid1 + mid2) / 2).toISOString();
    } else {
      return sorted[midIndex];
    }
  };

  // Use useEffect to update medianStartTimestamp when selection changes
  useEffect(() => {
    setMedianStartTimestamp(medianTimestamp(selectedStartTimestamps || []));
  }, [selectedStartTimestamps]);

  useEffect(() => {
    setMedianEndTimestamp(medianTimestamp(selectedEndTimestamps || []));
  }, [selectedEndTimestamps]);


  // Fetch on mount
  useEffect(() => {
    fetchTeams();
    fetchChallenges();
    fetchPenalties();
  }, []);

  useEffect(() => {
    if (!connectionStatus.is_active) return;

    fetchStartTimestamps();
    fetchEndTimestamps();

    const inverval = setInterval(() => {
      fetchStartTimestamps();
      fetchEndTimestamps();
    }, 3000); // every 3 second

    return () => clearInterval(inverval);
  }, [connectionStatus.is_active]);



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
                <Button variant="outline">
                  {selectedChallenge ? selectedChallenge.name : "Select Challenge"}
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
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={selectedTeam?.id.toString() || ""}
                  onValueChange={(value) => {
                    const team = teams.find((t) => t.id.toString() === value) || null;
                    setSelectedTeam(team);
                    fetchDriversForTeam();
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
            <CardTitle>Penalty</CardTitle>
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
          <CardContent className="space-y-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedPenalty ? selectedPenalty.type : "Select Penalty"}
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
              Penalty Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 space-x-3">
            <Input
              type="number"
              value={penaltyAmount ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setPenaltyAmount(value === "" ? null : Number(value));
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

      <div className="grid grid-cols-1 md:grid-cols-3 mb-4 gap-6">
        <Card>
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
                      ? medianTimestamp(selectedStartTimestamps)
                      : "Select Start Timestamps"}
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
                              prev ? prev.filter((t) => t !== timestamp) : null
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
                      ? medianTimestamp(selectedEndTimestamps)
                      : "Select End Timestamps"}
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
                              prev ? prev.filter((t) => t !== timestamp) : null
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



      </div>
    </div>
  );
}
