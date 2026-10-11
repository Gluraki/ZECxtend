import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatClock } from "@/lib/timestamps"

interface FormulaCardProps {
    startMicros: number | null
    endMicros: number | null
    manualAttemptTime: string | null
    penaltyCount: number
    selectedPenaltyAmount: number
}

export function FormulaCard({
    startMicros,
    endMicros,
    manualAttemptTime,
    penaltyCount,
    selectedPenaltyAmount,
}: FormulaCardProps) {
    const formatStamp = (micros: number | null) => (micros === null ? "00:00:00.000000" : formatClock(micros))

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Formula</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Attempt time formula = end time - start time + (amount of penalties * time penalty)</p>

                {manualAttemptTime == null ? (
                    <p className="text-sm text-muted-foreground">
                        Attempt time formula = {formatStamp(endMicros)} -{" "}
                        {formatStamp(startMicros)} + ({penaltyCount} *{" "}
                        {selectedPenaltyAmount})
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Attempt time formula = {manualAttemptTime} + ({penaltyCount} *{" "}
                        {selectedPenaltyAmount})
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
