"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/stats-card"
import { ServerListCard } from "@/components/server-list-card"
import { CreateServerModal } from "@/components/create-server-modal"
import { Spinner } from "@/components/ui/spinner"
import { useServers } from "@/hooks/use-servers"
import { Server, Users, HardDrive, Activity, Plus, AlertCircle } from "lucide-react"
import type { Server as ServerType } from "@/lib/api/types"

export default function HomePage() {
  const { servers, isLoading, error, mutate } = useServers()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalPlayers = servers.reduce((acc, s) => acc + s.players, 0)
  const onlineServers = servers.filter((s) => s.status === "online").length

  const handleServerCreated = (newServer: ServerType) => {
    mutate([...servers, newServer], false)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Carregando servidores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground">Erro ao carregar servidores</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Meus Servidores</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Gerencie todos os seus servidores Minecraft
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Servidor
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatsCard
          title="Servidores Online"
          value={`${onlineServers}/${servers.length}`}
          icon={Server}
        />
        <StatsCard
          title="Jogadores Ativos"
          value={totalPlayers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Uso de Disco"
          value="45.2 GB"
          icon={HardDrive}
        />
        <StatsCard
          title="Uptime Medio"
          value="99.8%"
          icon={Activity}
          trend={{ value: 0.3, isPositive: true }}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground md:text-lg">
          Lista de Servidores
        </h2>
        {servers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <Server className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Nenhum servidor criado ainda</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro servidor
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {servers.map((server) => (
              <ServerListCard
                key={server.id}
                id={server.id}
                name={server.name}
                version={`${server.loader.charAt(0).toUpperCase() + server.loader.slice(1)} ${server.minecraftVersion}`}
                status={server.status}
                players={server.players}
                maxPlayers={server.maxPlayers}
              />
            ))}
          </div>
        )}
      </div>

      <CreateServerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onServerCreated={handleServerCreated}
      />
    </div>
  )
}
