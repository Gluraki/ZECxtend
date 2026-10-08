import { Loader2 } from "lucide-react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

interface Props extends ComponentProps<typeof Button> {
  loading: boolean
}

export function LoadingButton({ loading, disabled, children, ...props }: Props) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
