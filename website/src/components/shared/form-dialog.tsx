import type { ReactNode } from "react"
import { LoadingButton } from "@/components/shared/loading-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAction } from "@/hooks/use-action"

interface Props {
  title: string
  description?: string
  submitLabel: string
  successMessage: string
  className?: string
  destructive?: boolean
  onSubmit: () => Promise<unknown>
  onSaved: () => void
  onClose: () => void
  children?: ReactNode
}

export function FormDialog({
  title,
  description,
  submitLabel,
  successMessage,
  className,
  destructive = false,
  onSubmit,
  onSaved,
  onClose,
  children,
}: Props) {
  const { pending, run } = useAction()

  const handleSubmit = async () => {
    if (await run(onSubmit, successMessage)) onSaved()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="min-w-0 space-y-4">{children}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <LoadingButton
            variant={destructive ? "destructive" : "default"}
            loading={pending}
            onClick={handleSubmit}
          >
            {submitLabel}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
