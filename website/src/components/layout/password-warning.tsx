import { TriangleAlert } from "lucide-react"
import { useAuth } from "@/auth/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Props {
  onChangePassword: () => void
}

export function PasswordWarning({ onChangePassword }: Props) {
  const { session } = useAuth()
  if (!session?.mustChangePassword) return null

  return (
    <Alert className="mb-6 border-yellow-500 bg-yellow-50 text-yellow-700">
      <TriangleAlert />
      <AlertDescription className="flex items-center justify-between gap-4 text-yellow-700">
        <span>Your password has to be changed. Please set a new one.</span>
        <Button variant="outline" size="sm" onClick={onChangePassword}>
          Change Password
        </Button>
      </AlertDescription>
    </Alert>
  )
}
