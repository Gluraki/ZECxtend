import { useState } from "react"
import { createUser } from "@/api/users"
import { FormDialog } from "@/components/shared/form-dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { UserFields, type UserFormValues } from "@/features/users/user-fields"
import type { Team } from "@/types/team"

const EMPTY_USER: UserFormValues = { username: "", password: "", team_id: null, role: "USER" }

interface Props {
  teams: Team[]
  onSaved: () => void
  onClose: () => void
}

export function CreateUserDialog({ teams, onSaved, onClose }: Props) {
  const [values, setValues] = useState(EMPTY_USER)
  const [mustChangePassword, setMustChangePassword] = useState(true)

  return (
    <FormDialog
      title="Add New User"
      submitLabel="Create User"
      successMessage="User created successfully"
      onSubmit={() =>
        createUser({ ...values, username: values.username.trim(), must_change_password: mustChangePassword })
      }
      onSaved={onSaved}
      onClose={onClose}
    >
      <UserFields
        values={values}
        onChange={setValues}
        teams={teams}
        passwordLabel="Password"
        teamLabel="Team (optional)"
      />
      <div className="flex items-center gap-2">
        <Switch id="must-change-password" checked={mustChangePassword} onCheckedChange={setMustChangePassword} />
        <Label htmlFor="must-change-password">Require password change on next login</Label>
      </div>
    </FormDialog>
  )
}
