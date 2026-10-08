import type { ReactNode } from "react"
import { LoadingState } from "@/components/shared/loading-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Props {
  title: string
  columns: string[]
  loading?: boolean
  empty: boolean
  emptyMessage: string
  children: ReactNode
}

export function TableCard({ title, columns, loading = false, empty, emptyMessage, children }: Props) {
  const lastIndex = columns.length - 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <LoadingState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={column} className={index === lastIndex ? "text-right" : undefined}>
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {empty && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
              {children}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
