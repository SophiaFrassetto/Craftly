"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { API_CONFIG } from "@/lib/api/config"
import type { 
  WebSocketEvent, 
  ServerStatusEvent, 
  ServerStatsEvent, 
  LogEvent,
  PlayerEvent,
  ServerLog,
  ServerStatus
} from "@/lib/api/types"

interface UseWebSocketOptions {
  serverId: string
  onStatusChange?: (status: ServerStatus, players: number) => void
  onStatsUpdate?: (stats: ServerStatsEvent) => void
  onLog?: (log: ServerLog) => void
  onPlayerJoin?: (player: PlayerEvent["player"]) => void
  onPlayerLeave?: (player: PlayerEvent["player"]) => void
  enabled?: boolean
}

interface UseWebSocketReturn {
  isConnected: boolean
  error: string | null
  sendCommand: (command: string) => void
  reconnect: () => void
}

// Gerador de logs mockados
function generateMockLog(): ServerLog {
  const messages = [
    { level: "info" as const, message: "[Server] Tick processado em 50ms" },
    { level: "info" as const, message: "[Server] Autosave concluido" },
    { level: "info" as const, message: "[Server] Chunk carregado em world" },
    { level: "success" as const, message: "[Server] Backup incremental concluido" },
    { level: "warn" as const, message: "[Server] Memoria alta: 75% utilizada" },
    { level: "info" as const, message: "[Chat] <Steve_BR> Ola pessoal!" },
    { level: "info" as const, message: "[Server] Plugin EssentialsX recarregado" },
  ]
  const random = messages[Math.floor(Math.random() * messages.length)]
  return {
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    ...random,
  }
}

export function useWebSocket({
  serverId,
  onStatusChange,
  onStatsUpdate,
  onLog,
  onPlayerJoin,
  onPlayerLeave,
  enabled = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (!enabled) return

    // Modo mock - simula atualizacoes via WebSocket
    if (API_CONFIG.useMock) {
      setIsConnected(true)
      setError(null)

      // Simula logs em tempo real
      mockIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.6) {
          onLog?.(generateMockLog())
        }
        
        // Simula atualizacao de stats ocasional
        if (Math.random() > 0.8) {
          onStatsUpdate?.({
            tps: 19.5 + Math.random() * 0.5,
            cpuUsage: 30 + Math.random() * 20,
            memoryUsage: 60 + Math.random() * 15,
            uptime: Date.now(),
          })
        }
      }, 3000)

      return
    }

    // Conexao WebSocket real
    try {
      const ws = new WebSocket(`${API_CONFIG.wsUrl}?serverId=${serverId}`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data)
          
          if (data.serverId !== serverId) return

          switch (data.type) {
            case "server_status":
              const statusPayload = data.payload as ServerStatusEvent
              onStatusChange?.(statusPayload.status, statusPayload.players)
              break
            case "server_stats":
              onStatsUpdate?.(data.payload as ServerStatsEvent)
              break
            case "log":
            case "console_output":
              onLog?.((data.payload as LogEvent).log)
              break
            case "player_join":
              onPlayerJoin?.((data.payload as PlayerEvent).player)
              break
            case "player_leave":
              onPlayerLeave?.((data.payload as PlayerEvent).player)
              break
          }
        } catch (e) {
          console.error("Erro ao processar mensagem WebSocket:", e)
        }
      }

      ws.onerror = () => {
        setError("Erro na conexao WebSocket")
        setIsConnected(false)
      }

      ws.onclose = () => {
        setIsConnected(false)
        // Reconectar automaticamente apos 5 segundos
        reconnectTimeoutRef.current = setTimeout(connect, 5000)
      }
    } catch (e) {
      setError("Falha ao conectar WebSocket")
      setIsConnected(false)
    }
  }, [serverId, enabled, onStatusChange, onStatsUpdate, onLog, onPlayerJoin, onPlayerLeave])

  const disconnect = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current)
      mockIntervalRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const sendCommand = useCallback((command: string) => {
    if (API_CONFIG.useMock) {
      onLog?.({
        id: String(Date.now()),
        timestamp: new Date().toISOString(),
        level: "info",
        message: `> ${command}`,
      })
      setTimeout(() => {
        onLog?.({
          id: String(Date.now() + 1),
          timestamp: new Date().toISOString(),
          level: "success",
          message: `[Server] Comando executado: ${command}`,
        })
      }, 200)
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", command }))
    }
  }, [onLog])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [disconnect, connect])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { isConnected, error, sendCommand, reconnect }
}
