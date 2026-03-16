"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Users, ChevronRight } from "lucide-react"

interface ServerListCardProps {
  id: string
  name: string
  version: string
  status: "online" | "offline" | "starting"
  players: number
  maxPlayers: number
}

export function ServerListCard({
  id,
  name,
  version,
  status,
  players,
  maxPlayers,
}: ServerListCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "online":
        return <Badge className="bg-success text-xs text-primary-foreground">Online</Badge>
      case "offline":
        return <Badge variant="secondary" className="text-xs">Offline</Badge>
      case "starting":
        return <Badge className="bg-warning text-xs text-primary-foreground">Iniciando</Badge>
    }
  }

  return (
    <Link href={`/server/${id}`}>
      <Card className="group cursor-pointer border-border bg-card transition-colors hover:border-primary/50 hover:bg-card/80">
        <CardContent className="flex items-center gap-3 p-3 md:gap-4 md:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:h-12 md:w-12">
            <Server className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-foreground md:text-base">{name}</h3>
              <span className="md:hidden">{getStatusBadge()}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:gap-4 md:text-sm">
              <span className="truncate">{version}</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                {players}/{maxPlayers}
              </span>
            </div>
          </div>
          <div className="hidden md:block">{getStatusBadge()}</div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 md:h-5 md:w-5" />
        </CardContent>
      </Card>
    </Link>
  )
}
