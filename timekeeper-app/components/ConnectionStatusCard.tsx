'use client'

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ConnectionStatus {
    is_active: boolean
}

interface ConnectionStatusCardProps {
    status: ConnectionStatus
    setStatus: (status: ConnectionStatus) => void
}

export function ConnectionStatusCard({ status, setStatus }: ConnectionStatusCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className={status.is_active ? "text-green-600" : "text-red-600"}>
                    Status: {status.is_active ? "Active" : "Inactive"}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 space-x-3">
                <Button
                    onClick={() => setStatus({ is_active: true })}
                    className="bg-green-600 hover:bg-green-700 text-white text-2xl px-6 py-3"
                >
                    Activate
                </Button>

                <Button
                    onClick={() => setStatus({ is_active: false })}
                    className="bg-red-600 hover:bg-red-700 text-white text-2xl px-6 py-3"
                >
                    Deactivate
                </Button>
            </CardContent>
        </Card>
    )
}
