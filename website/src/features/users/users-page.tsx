import { Plus } from "lucide-react"
import { useState } from "react"
import { listTeams } from "@/api/teams"
import { deleteUser, listUsers } from "@/api/users"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { TableCard } from "@/components/shared/table-card"
import { Button } from "@/components/ui/button"
import { CreateUserDialog } from "@/features/users/create-user-dialog"
import { EditUserDialog } from "@/features/users/edit-user-dialog"
import { UserRow } from "@/features/users/user-row"
import { useApiData } from "@/hooks/use-api-data"
import type { User } from "@/types/user"

const COLUMNS = ["Username", "Team", "Role", "Actions"]

export function UsersPage() {
  const { data: users, loading, reload } = useApiData(listUsers, [], [])
  const { data: teams } = useApiData(listTeams, [], [])
  const [formUser, setFormUser] = useState<User | "new" | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)

  const closeForm = () => setFormUser(null)
  const onSaved = () => {
    closeForm()
    reload()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Management">
        <Button onClick={() => setFormUser("new")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </PageHeader>
      <TableCard
        title="All Users"
        columns={COLUMNS}
        loading={loading}
        empty={users.length === 0}
        emptyMessage="No users found."
      >
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            teamName={teams.find((team) => team.id === user.team_id)?.name}
            onEdit={() => setFormUser(user)}
            onDelete={() => setDeleting(user)}
          />
        ))}
      </TableCard>
      {formUser === "new" && <CreateUserDialog teams={teams} onSaved={onSaved} onClose={closeForm} />}
      {formUser && formUser !== "new" && (
        <EditUserDialog user={formUser} teams={teams} onSaved={onSaved} onClose={closeForm} />
      )}
      {deleting && (
        <DeleteDialog
          title="Delete User"
          description={`Are you sure you want to delete ${deleting.username}?`}
          successMessage="User deleted successfully"
          onDelete={() => deleteUser(deleting.id)}
          onDeleted={() => {
            setDeleting(null)
            reload()
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
