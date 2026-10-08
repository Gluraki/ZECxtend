import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NoTeamCard() {
  return (
    <div className="flex h-96 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Team Assigned</CardTitle>
          <CardDescription>
            You are not currently assigned to any team. Please contact an administrator to assign you to a team.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
