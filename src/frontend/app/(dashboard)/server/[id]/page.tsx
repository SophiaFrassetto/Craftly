"use client"

import { useState, use, useCallback } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ServerCard } from "@/components/server-card"
import { LogsPanel } from "@/components/logs-panel"
import { StatsCard } from "@/components/stats-card"
import { PlayersList } from "@/components/players-list"
import { ServerConfig } from "@/components/server-config"
import { FileManager } from "@/components/file-manager"
import { Spinner } from "@/components/ui/spinner"
import { useServer, useServerActions } from "@/hooks/use-servers"
import { useWebSocket } from "@/hooks/use-websocket"
import {
  Server,
  Users,
  Clock,
  Activity,
  ChevronLeft,
  LayoutDashboard,
  Settings,
  FolderOpen,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { ServerLog, ServerStatus } from "@/lib/api/types"
import { LOADER_NAMES } from "@/lib/api/mock-data"

export default function ServerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [realtimeLogs, setRealtimeLogs] = useState<ServerLog[]>([])
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [playerCount, setPlayerCount] = useState<number | null>(null)

  const { server, isLoading, error, mutate } = useServer(resolvedParams.id)
  const { start, stop, restart, isLoading: isActioning } = useServerActions(resolvedParams.id)

  const handleStatusChange = useCallback((status: ServerStatus, players: number) => {
    setServerStatus(status)
    setPlayerCount(players)
    mutate()
  }, [mutate])

  const handleLog = useCallback((log: ServerLog) => {
    setRealtimeLogs((prev) => [...prev.slice(-99), log])
  }, [])

  const { isConnected, sendCommand } = useWebSocket({
    serverId: resolvedParams.id,
    onStatusChange: handleStatusChange,
    onLog: handleLog,
    enabled: !!server,
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Carregando servidor...</p>
        </div>
      </div>
    )
  }

  if (error || !server) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground">Servidor nao encontrado</p>
          <Link href="/">
            <Button variant="outline" size="sm">
              Voltar para a lista
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const displayStatus = serverStatus || server.status
  const displayPlayers = playerCount ?? server.players
  const loaderName = LOADER_NAMES[server.loader] || server.loader

  const handleServerAction = async (action: "start" | "stop" | "restart") => {
    try {
      if (action === "start") await start()
      else if (action === "stop") await stop()
      else if (action === "restart") await restart()
      mutate()
    } catch (e) {
      console.error("Erro na acao do servidor:", e)
    }
  }

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "0m"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 md:mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 md:h-12 md:w-12">
              <Server className="h-5 w-5 text-primary md:h-6 md:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-foreground md:text-2xl">
                {server.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {loaderName} {server.minecraftVersion}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-xs text-success">
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <WifiOff className="h-3 w-3" />
                <span className="hidden sm:inline">Desconectado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full justify-start overflow-x-auto md:mb-6 md:w-auto">
          <TabsTrigger value="dashboard" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <LayoutDashboard className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Painel</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Configuracoes</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-1.5 text-xs md:gap-2 md:text-sm">
            <FolderOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Arquivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <div className="mb-4 grid grid-cols-2 gap-3 md:mb-6 md:gap-4 lg:grid-cols-4">
            <StatsCard
              title="Status"
              value={displayStatus === "online" ? "Online" : displayStatus === "starting" ? "Iniciando" : "Offline"}
              icon={Server}
              trend={displayStatus === "online" ? { value: 99.9, isPositive: true } : undefined}
            />
            <StatsCard
              title="Jogadores"
              value={`${displayPlayers}/${server.maxPlayers}`}
              icon={Users}
            />
            <StatsCard
              title="Uptime"
              value={formatUptime(server.uptime)}
              icon={Clock}
            />
            <StatsCard
              title="TPS"
              value={server.tps?.toFixed(1) || "0.0"}
              icon={Activity}
              trend={server.tps ? { value: server.tps >= 19 ? 2 : -5, isPositive: server.tps >= 19 } : undefined}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <div className="space-y-4 md:space-y-6 lg:col-span-2">
              <ServerCard
                serverName={server.name}
                version={`${loaderName} ${server.minecraftVersion}`}
                initialStatus={displayStatus}
                maxPlayers={server.maxPlayers}
                currentPlayers={displayPlayers}
                cpuUsage={server.cpuUsage}
                memoryUsage={server.memoryUsage}
                minRam={server.minRam}
                maxRam={server.maxRam}
                onStart={() => handleServerAction("start")}
                onStop={() => handleServerAction("stop")}
                onRestart={() => handleServerAction("restart")}
                isLoading={isActioning}
              />
              <LogsPanel
                serverId={resolvedParams.id}
                realtimeLogs={realtimeLogs}
                onSendCommand={sendCommand}
              />
            </div>

            <div className="space-y-4 md:space-y-6">
              <PlayersList serverId={resolvedParams.id} />

              <div className="rounded-lg border border-border bg-card p-3 md:p-4">
                <h3 className="mb-3 text-sm font-medium text-foreground md:text-base">Acoes Rapidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 md:text-sm">
                    Backup
                  </button>
                  <button className="rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 md:text-sm">
                    Whitelist
                  </button>
                  <button className="rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 md:text-sm">
                    Plugins
                  </button>
                  <button
                    className="rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80 md:text-sm"
                    onClick={() => setActiveTab("config")}
                  >
                    Configuracoes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-0">
          <ServerConfig serverId={resolvedParams.id} />
        </TabsContent>

        <TabsContent value="files" className="mt-0">
          <FileManager serverId={resolvedParams.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
