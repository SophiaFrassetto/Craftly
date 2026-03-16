"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import * as api from "@/lib/api/client"
import type { Server, CreateServerRequest, LoaderType } from "@/lib/api/types"

// Hook para listar servidores
export function useServers() {
  const { data, error, isLoading, mutate } = useSWR(
    "servers",
    async () => {
      const result = await api.getServers()
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  )

  return {
    servers: data || [],
    isLoading,
    error: error?.message,
    mutate,
  }
}

// Hook para obter um servidor especifico
export function useServer(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `server-${id}` : null,
    async () => {
      const result = await api.getServer(id)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  )

  return {
    server: data,
    isLoading,
    error: error?.message,
    mutate,
  }
}

// Hook para criar servidor
export function useCreateServer() {
  const { trigger, isMutating, error } = useSWRMutation(
    "servers",
    async (_key: string, { arg }: { arg: CreateServerRequest }) => {
      const result = await api.createServer(arg)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  )

  return {
    createServer: trigger,
    isCreating: isMutating,
    error: error?.message,
  }
}

// Hook para acoes do servidor (start/stop/restart)
export function useServerActions(id: string) {
  const startMutation = useSWRMutation(
    `server-${id}`,
    async () => {
      const result = await api.startServer(id)
      if (!result.success) throw new Error(result.error)
    }
  )

  const stopMutation = useSWRMutation(
    `server-${id}`,
    async () => {
      const result = await api.stopServer(id)
      if (!result.success) throw new Error(result.error)
    }
  )

  const restartMutation = useSWRMutation(
    `server-${id}`,
    async () => {
      const result = await api.restartServer(id)
      if (!result.success) throw new Error(result.error)
    }
  )

  return {
    start: startMutation.trigger,
    stop: stopMutation.trigger,
    restart: restartMutation.trigger,
    isStarting: startMutation.isMutating,
    isStopping: stopMutation.isMutating,
    isRestarting: restartMutation.isMutating,
    isLoading: startMutation.isMutating || stopMutation.isMutating || restartMutation.isMutating,
  }
}

// Hook para jogadores
export function usePlayers(serverId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `players-${serverId}` : null,
    async () => {
      const result = await api.getPlayers(serverId)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    { refreshInterval: 30000 } // Atualiza a cada 30 segundos
  )

  const kickMutation = useSWRMutation(
    `players-${serverId}`,
    async (_key: string, { arg }: { arg: { uuid: string; reason?: string } }) => {
      const result = await api.kickPlayer(serverId, arg.uuid, arg.reason)
      if (!result.success) throw new Error(result.error)
    }
  )

  return {
    players: data || [],
    isLoading,
    error: error?.message,
    mutate,
    kick: kickMutation.trigger,
    isKicking: kickMutation.isMutating,
  }
}

// Hook para versoes do Minecraft
export function useMinecraftVersions() {
  const { data, error, isLoading } = useSWR(
    "minecraft-versions",
    async () => {
      const result = await api.getMinecraftVersions()
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    { revalidateOnFocus: false }
  )

  return {
    versions: data || [],
    isLoading,
    error: error?.message,
  }
}

// Hook para versoes do loader
export function useLoaderVersions(loader: LoaderType | null) {
  const { data, error, isLoading } = useSWR(
    loader ? `loader-versions-${loader}` : null,
    async () => {
      if (!loader) return []
      const result = await api.getLoaderVersions(loader)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    { revalidateOnFocus: false }
  )

  return {
    versions: data || [],
    isLoading,
    error: error?.message,
  }
}

// Hook para configuracoes do servidor
export function useServerConfig(serverId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `config-${serverId}` : null,
    async () => {
      const result = await api.getServerConfig(serverId)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  )

  const updateMutation = useSWRMutation(
    `config-${serverId}`,
    async (_key: string, { arg }: { arg: Record<string, string | number | boolean> }) => {
      const result = await api.updateServerConfig(serverId, arg)
      if (!result.success) throw new Error(result.error)
    }
  )

  return {
    config: data || {},
    isLoading,
    error: error?.message,
    mutate,
    update: updateMutation.trigger,
    isUpdating: updateMutation.isMutating,
  }
}

// Hook para logs
export function useLogs(serverId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `logs-${serverId}` : null,
    async () => {
      const result = await api.getLogs(serverId)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  )

  return {
    logs: data || [],
    isLoading,
    error: error?.message,
    mutate,
  }
}

// Hook para arquivos
export function useFiles(serverId: string, path: string) {
  const { data, error, isLoading, mutate } = useSWR(
    serverId ? `files-${serverId}-${path}` : null,
    async () => {
      const result = await api.listFiles(serverId, path)
      if (!result.success) throw new Error(result.error)
      return result.data
    }
  )

  return {
    files: data || [],
    isLoading,
    error: error?.message,
    mutate,
  }
}
