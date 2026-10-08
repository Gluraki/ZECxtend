import { useAuth } from "@/auth/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ROLE_LABELS } from "@/lib/labels"
import type { Session } from "@/types/auth"

interface Props {
  session: Session
}

export function AccountInfo({ session }: Props) {
  const { logout } = useAuth()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Username</Label>
          <p className="text-lg">{session.username}</p>
        </div>
        <div>
          <Label className="text-sm font-medium">Role</Label>
          <p className="text-lg">{ROLE_LABELS[session.role]}</p>
        </div>
        <Button onClick={logout} variant="destructive" className="w-full">
          Logout
        </Button>
      </CardContent>
    </Card>
  )
}
