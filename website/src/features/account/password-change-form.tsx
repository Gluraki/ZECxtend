import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { useAuth } from "@/auth/use-auth"
import { LoadingButton } from "@/components/shared/loading-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { errorMessage } from "@/lib/errors"

const FIELDS = [
  { id: "current-password", label: "Current Password", autoComplete: "current-password" },
  { id: "new-password", label: "New Password", autoComplete: "new-password" },
  { id: "confirm-password", label: "Confirm New Password", autoComplete: "new-password" },
] as const

type FieldId = (typeof FIELDS)[number]["id"]

const EMPTY: Record<FieldId, string> = { "current-password": "", "new-password": "", "confirm-password": "" }

export function PasswordChangeForm() {
  const { session, changePassword } = useAuth()
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (values["new-password"] !== values["confirm-password"]) {
      setError("The new passwords do not match")
      return
    }
    setLoading(true)
    try {
      await changePassword(values["current-password"], values["new-password"])
      setValues(EMPTY)
      toast.success("Password changed successfully")
    } catch (err) {
      setError(errorMessage(err, "Failed to change password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {session?.mustChangePassword && (
            <Alert className="border-yellow-500 bg-yellow-50 text-yellow-700">
              <AlertDescription className="text-yellow-700">
                Your password has to be changed. Please set a new one.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {FIELDS.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type="password"
                value={values[field.id]}
                onChange={(event) => setValues({ ...values, [field.id]: event.target.value })}
                autoComplete={field.autoComplete}
                required
                disabled={loading}
              />
            </div>
          ))}
          <LoadingButton type="submit" className="w-full" loading={loading}>
            Change Password
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  )
}
