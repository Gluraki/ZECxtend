import { useState } from "react"
import { updateUser } from "@/api/users"
import { FormDialog } from "@/components/shared/form-dialog"
import { UserFields } from "@/features/users/user-fields"
import { changedFields } from "@/lib/changed-fields"
import type { Team } from "@/types/team"
import type { User } from "@/types/user"

interface Props {
  user: User
  teams: Team[]
  onSaved: () => void
  onClose: () => void
}

export function EditUserDialog({ user, teams, onSaved, onClose }: Props) {
  const [values, setValues] = useState({ username: user.username, password: "", team_id: user.team_id, role: user.role })

  const submit = () => {
    const { password, ...fields } = values
    const update = changedFields(user, { ...fields, username: fields.username.trim() })
    return updateUser(user.id, password ? { ...update, password } : update)
  }

  return (
    <FormDialog
      title="Edit User"
      submitLabel="Update User"
      successMessage="User updated successfully"
      onSubmit={submit}
      onSaved={onSaved}
      onClose={onClose}
    >
      <UserFields
        values={values}
        onChange={setValues}
        teams={teams}
        passwordLabel="Password (leave empty to keep current)"
        teamLabel="Team"
      />
    </FormDialog>
  )
}
