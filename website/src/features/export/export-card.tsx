import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { ChallengeSelect } from "@/components/shared/challenge-select"
import { OptionSelect } from "@/components/shared/option-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAction } from "@/hooks/use-action"
import { triggerDownload } from "@/lib/download"
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/labels"
import type { Challenge } from "@/types/challenge"
import type { ExportFormat } from "@/types/export"
import type { TeamCategory } from "@/types/team"

const ALL = "all"

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel" },
]

const CATEGORY_OPTIONS = CATEGORIES.map((category) => ({ value: category, label: CATEGORY_LABELS[category] }))

interface ExportFile {
  blob: Blob
  filename: string
}

interface Props {
  title: string
  buttonLabel: string
  successMessage: string
  challenges: Challenge[]
  loadingChallenges: boolean
  categoryOptional?: boolean
  onExport: (challengeId: number, format: ExportFormat, category: TeamCategory | undefined) => Promise<ExportFile>
}

export function ExportCard({
  title,
  buttonLabel,
  successMessage,
  challenges,
  loadingChallenges,
  categoryOptional,
  onExport,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [category, setCategory] = useState<TeamCategory | typeof ALL>(categoryOptional ? ALL : "advanced_class")
  const [format, setFormat] = useState<ExportFormat>("csv")
  const { pending, run } = useAction()
  const challengeId = selected ?? challenges[0]?.id ?? null

  const categoryOptions: { value: TeamCategory | typeof ALL; label: string }[] = categoryOptional
    ? [{ value: ALL, label: "All categories" }, ...CATEGORY_OPTIONS]
    : CATEGORY_OPTIONS

  const handleExport = () =>
    challengeId !== null &&
    run(async () => {
      const file = await onExport(challengeId, format, category === ALL ? undefined : category)
      triggerDownload(file.blob, file.filename)
    }, successMessage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Challenge</Label>
          <ChallengeSelect
            challenges={challenges}
            value={challengeId}
            onChange={setSelected}
            disabled={loadingChallenges}
            className="mt-2 w-full"
          />
        </div>
        <div>
          <Label>
            Category {categoryOptional && <span className="text-xs text-muted-foreground">(optional)</span>}
          </Label>
          <OptionSelect value={category} options={categoryOptions} onChange={setCategory} className="mt-2 w-full" />
        </div>
        <div>
          <Label>Format</Label>
          <OptionSelect value={format} options={FORMAT_OPTIONS} onChange={setFormat} className="mt-2 w-full" />
        </div>
        <Button onClick={handleExport} disabled={pending || challengeId === null} className="flex w-full items-center gap-2">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {pending ? "Exporting..." : buttonLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
