import { FormDialog } from "@/components/shared/form-dialog"

interface Props {
  title: string
  description: string
  successMessage: string
  onDelete: () => Promise<unknown>
  onDeleted: () => void
  onClose: () => void
}

export function DeleteDialog({ title, description, successMessage, onDelete, onDeleted, onClose }: Props) {
  return (
    <FormDialog
      title={title}
      description={description}
      submitLabel="Delete"
      successMessage={successMessage}
      destructive
      onSubmit={onDelete}
      onSaved={onDeleted}
      onClose={onClose}
    />
  )
}
