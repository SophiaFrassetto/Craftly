"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  Play,
  Square,
  RotateCcw,
  Server,
  Users,
  Cpu,
  HardDrive,
  Clock,
} from "lucide-react"
import type { ServerStatus } from "@/lib/api/types"

interface ServerCardProps {
  serverName: string
  version: string
  initialStatus?: ServerStatus
  maxPlayers: number
  currentPlayers?: number
  cpuUsage?: number
  memoryUsage?: number
  minRam?: number
  maxRam?: number
  uptime?: number
  onStart?: () => void
  onStop?: () => void
  onRestart?: () => void
  isLoading?: boolean
}

export function ServerCard({
  serverName,
  version,
  initialStatus = "offline",
  maxPlayers,
  currentPlayers = 0,
  cpuUsage = 0,
  memoryUsage = 0,
  minRam = 2048,
  maxRam = 4096,
  uptime,
  onStart,
  onStop,
  onRestart,
  isLoading = false,
}: ServerCardProps) {
  const status = initialStatus

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "-"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatRam = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)}G`
    return `${mb}M`
  }

  const getStatusBadge = () => {
    switch (status) {
      case "online":
        return <Badge className="bg-success text-xs text-primary-foreground">Online</Badge>
      case "offline":
        return <Badge variant="secondary" className="text-xs">Offline</Badge>
      case "starting":
        return (
          <Badge className="bg-warning text-xs text-primary-foreground">
            <Spinner className="mr-1 h-3 w-3" />
            Iniciando
          </Badge>
        )
      case "stopping":
        return (
          <Badge className="bg-warning text-xs text-primary-foreground">
            <Spinner className="mr-1 h-3 w-3" />
            Parando
          </Badge>
        )
      case "error":
        return <Badge variant="destructive" className="text-xs">Erro</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Desconhecido</Badge>
    }
  }

  const isProcessing = status === "starting" || status === "stopping" || isLoading

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 md:p-4 md:pb-2">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:h-10 md:w-10">
            <Server className="h-4 w-4 text-primary md:h-5 md:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base text-foreground md:text-lg">{serverName}</CardTitle>
            <p className="text-xs text-muted-foreground md:text-sm">{version}</p>
          </div>
        </div>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0 md:space-y-4 md:p-4 md:pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs md:gap-4 md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
            <span className="text-muted-foreground">Jogadores:</span>
            <span className="font-medium text-foreground">
              {currentPlayers}/{maxPlayers}
            </span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
            <span className="text-muted-foreground">Uptime:</span>
            <span className="font-medium text-foreground">{formatUptime(uptime)}</span>
          </div>
        </div>

        <div className="space-y-2 md:space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground md:gap-2">
                <Cpu className="h-3.5 w-3.5 md:h-4 md:w-4" />
                CPU
              </span>
              <span className="font-medium text-foreground">
                {status === "online" ? `${cpuUsage}%` : "-"}
              </span>
            </div>
            <Progress value={status === "online" ? cpuUsage : 0} className="h-1.5 md:h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground md:gap-2">
                <HardDrive className="h-3.5 w-3.5 md:h-4 md:w-4" />
                RAM ({formatRam(minRam)}-{formatRam(maxRam)})
              </span>
              <span className="font-medium text-foreground">
                {status === "online" ? `${memoryUsage}%` : "-"}
              </span>
            </div>
            <Progress value={status === "online" ? memoryUsage : 0} className="h-1.5 md:h-2" />
          </div>
        </div>

        <div className="flex gap-2 pt-1 md:pt-2">
          {status === "offline" || status === "error" ? (
            <Button
              onClick={onStart}
              disabled={isProcessing}
              className="flex-1 bg-primary text-xs text-primary-foreground hover:bg-primary/90 md:text-sm"
            >
              {isLoading ? (
                <Spinner className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              ) : (
                <Play className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              )}
              Iniciar
            </Button>
          ) : (
            <Button
              onClick={onStop}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1 text-xs md:text-sm"
            >
              {isLoading ? (
                <Spinner className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              ) : (
                <Square className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
              )}
              Parar
            </Button>
          )}
          <Button
            onClick={onRestart}
            disabled={status === "offline" || isProcessing}
            variant="secondary"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9"
          >
            {isLoading ? (
              <Spinner className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
