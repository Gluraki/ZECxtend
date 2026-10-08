import { useCallback, useState } from "react"
import { toast } from "sonner"
import { errorMessage } from "@/lib/errors"

export function useAction() {
  const [pending, setPending] = useState(false)

  const run = useCallback(async (action: () => Promise<unknown>, successMessage: string) => {
    setPending(true)
    try {
      await action()
      toast.success(successMessage)
      return true
    } catch (error) {
      toast.error(errorMessage(error))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, run }
}
