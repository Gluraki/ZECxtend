import { Button } from "@/components/ui/button"

interface TeamsTabProps {
  visibleTeams: any[]
  setIsAddTeamOpen: (open: boolean) => void
  setEditingTeam: (team: any) => void
  handleDeleteTeam: (id: string | number) => void
  canEdit?: boolean
}

export default function TeamsTab({
  visibleTeams,
  setIsAddTeamOpen,
  setEditingTeam,
  handleDeleteTeam,
  canEdit = true,
}: TeamsTabProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        {canEdit && (
          <Button onClick={() => setIsAddTeamOpen(true)}>
            Add Team
          </Button>
        )}
      </div>

      {visibleTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No teams found
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{team.name}</h3>
                {team.description && (
                  <p className="text-sm text-gray-600">{team.description}</p>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTeam(team)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
