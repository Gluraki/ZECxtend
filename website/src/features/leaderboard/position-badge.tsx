import { cn } from "cn"

const RANK_COLORS: Record<number, string> = {
  1: "bg-yellow-500",
  2: "bg-gray-400",
  3: "bg-orange-600",
}

interface Props {
  rank: number
}

export function PositionBadge({ rank }: Props) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white",
        RANK_COLORS[rank] ?? "bg-blue-600",
      )}
    >
      {rank}
    </div>
  )
}
