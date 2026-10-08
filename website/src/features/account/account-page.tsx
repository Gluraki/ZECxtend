import { useAuth } from "@/auth/use-auth"
import { AccountInfo } from "@/features/account/account-info"
import { LoginForm } from "@/features/account/login-form"
import { PasswordChangeForm } from "@/features/account/password-change-form"

interface Props {
  onLogin: () => void
}

export function AccountPage({ onLogin }: Props) {
  const { session } = useAuth()

  if (!session) return <LoginForm onLogin={onLogin} />

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <AccountInfo session={session} />
      <PasswordChangeForm />
    </div>
  )
}
