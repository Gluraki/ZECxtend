"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Edit, Trash2, Plus } from "lucide-react"

interface Props {
  challenges: any[]
  setIsAddChallengeOpen: (open: boolean) => void
  setEditingChallenge: (c: any) => void
  deleteChallenge?: (id: number) => void
}

export default function ChallengeTab({
  challenges,
  setIsAddChallengeOpen,
  setEditingChallenge,
  deleteChallenge,
}: Props) {
  const formatDate = (d?: string) => (d ? new Date(d).toLocaleString() : "—")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Challenge Management</h2>

        <Button
          onClick={() => setIsAddChallengeOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Challenge</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Max Attempts</TableHead>
                <TableHead>Start MACs</TableHead>
                <TableHead>Finish MACs</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {challenges.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No challenges found.
                  </TableCell>
                </TableRow>
              )}

              {challenges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>

                  <TableCell>{c.max_attempts ?? "—"}</TableCell>

                  <TableCell>
                    {[c.esp_mac_start1, c.esp_mac_start2]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>

                  <TableCell>
                    {[c.esp_mac_finish1, c.esp_mac_finish2]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>

                  <TableCell>{formatDate(c.created_at)}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingChallenge(c)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {deleteChallenge && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteChallenge(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
