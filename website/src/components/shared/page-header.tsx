import type { ReactNode } from "react"

interface Props {
  title: string
  children?: ReactNode
}

export function PageHeader({ title, children }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </div>
  )
}
