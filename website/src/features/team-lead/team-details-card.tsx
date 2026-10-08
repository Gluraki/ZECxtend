import { Edit, Trophy, Weight, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamDetail } from "@/features/team-lead/team-detail"
import { CATEGORY_LABELS } from "@/lib/labels"
import type { Team } from "@/types/team"

interface Props {
  team: Team
  onEdit: () => void
}

export function TeamDetailsCard({ team, onEdit }: Props) {
  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl">Team Details</CardTitle>
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Team
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <TeamDetail icon={Trophy} label="Category">
            <Badge className="px-3 py-1 text-base">{CATEGORY_LABELS[team.category]}</Badge>
          </TeamDetail>
          <TeamDetail icon={Weight} label="Vehicle Weight">
            <p className="text-2xl font-bold">{team.vehicle_weight} kg</p>
          </TeamDetail>
          <TeamDetail icon={Zap} label="Mean Power">
            <p className="text-2xl font-bold">{team.mean_power} W</p>
          </TeamDetail>
          <TeamDetail label="RFID Identifier">
            <p className="font-mono text-lg font-semibold">{team.rfid_identifier}</p>
          </TeamDetail>
        </div>
      </CardContent>
    </Card>
  )
}
