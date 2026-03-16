"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Pause, Play, Trash2, Download, Send } from "lucide-react"
import { useLogs } from "@/hooks/use-servers"
import type { ServerLog } from "@/lib/api/types"

interface LogsPanelProps {
  serverId: string
  realtimeLogs?: ServerLog[]
  onSendCommand?: (command: string) => void
}

export function LogsPanel({ serverId, realtimeLogs = [], onSendCommand }: LogsPanelProps) {
  const { logs: initialLogs, isLoading } = useLogs(serverId)
  const [isPaused, setIsPaused] = useState(false)
  const [command, setCommand] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Combinar logs iniciais com logs em tempo real
  const allLogs = [...initialLogs, ...realtimeLogs]

  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allLogs, isPaused])

  const getLogColor = (level: ServerLog["level"]) => {
    switch (level) {
      case "success":
        return "text-success"
      case "warn":
        return "text-warning"
      case "error":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const handleClear = () => {
    // Em producao, isso limparia apenas a visualizacao local
  }

  const handleDownload = () => {
    const content = allLogs
      .map((log) => {
        const time = new Date(log.timestamp).toLocaleTimeString("pt-BR")
        return `[${time}] [${log.level.toUpperCase()}] ${log.message}`
      })
      .join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `server-logs-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && onSendCommand) {
      onSendCommand(command.trim())
      setCommand("")
    }
  }

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 md:p-4 md:pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-foreground md:text-lg">
          <Terminal className="h-4 w-4 text-primary md:h-5 md:w-5" />
          Console
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Continuar" : "Pausar"}
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5 md:h-4 md:w-4" />
            ) : (
              <Pause className="h-3.5 w-3.5 md:h-4 md:w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8"
            onClick={handleClear}
            title="Limpar"
          >
            <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 md:h-8 md:w-8"
            onClick={handleDownload}
            title="Baixar"
          >
            <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-0">
        <ScrollArea className="h-[250px] px-3 md:h-[350px] md:px-4" ref={scrollRef}>
          <div className="space-y-1 font-mono text-xs md:text-sm">
            {isLoading ? (
              <p className="py-8 text-center text-muted-foreground">Carregando logs...</p>
            ) : allLogs.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Nenhum log disponivel</p>
            ) : (
              allLogs.map((log) => (
                <div key={log.id} className="flex gap-1 md:gap-2">
                  <span className="shrink-0 text-muted-foreground">
                    [{new Date(log.timestamp).toLocaleTimeString("pt-BR")}]
                  </span>
                  <span className={`break-all ${getLogColor(log.level)}`}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input de comando */}
        <form onSubmit={handleSendCommand} className="flex gap-2 border-t border-border p-3 md:p-4">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Digite um comando..."
            className="h-8 flex-1 font-mono text-xs md:h-9 md:text-sm"
          />
          <Button type="submit" size="icon" className="h-8 w-8 md:h-9 md:w-9" disabled={!command.trim()}>
            <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
