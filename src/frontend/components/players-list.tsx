"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Users, MessageSquare, Ban, Signal, Crown } from "lucide-react"
import { usePlayers } from "@/hooks/use-servers"

interface PlayersListProps {
  serverId: string
}

function getPingColor(ping: number) {
  if (ping < 50) return "text-success"
  if (ping < 100) return "text-warning"
  return "text-destructive"
}

function formatConnectedTime(joinedAt: string) {
  const diff = Date.now() - new Date(joinedAt).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export function PlayersList({ serverId }: PlayersListProps) {
  const { players, isLoading, kick, isKicking } = usePlayers(serverId)

  const handleKick = async (uuid: string, name: string) => {
    if (confirm(`Tem certeza que deseja expulsar ${name}?`)) {
      await kick({ uuid, reason: "Expulso pelo administrador" })
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="p-3 pb-2 md:p-4 md:pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-foreground md:text-lg">
          <Users className="h-4 w-4 text-primary md:h-5 md:w-5" />
          <span className="hidden sm:inline">Jogadores Online</span>
          <span className="sm:hidden">Online</span>
          <span className="ml-auto text-xs font-normal text-muted-foreground md:text-sm">
            {players.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[240px] md:h-[280px]">
          <div className="space-y-1 p-3 pt-0 md:p-4 md:pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : players.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum jogador online
              </p>
            ) : (
              players.map((player) => (
                <div
                  key={player.uuid}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-secondary md:gap-3 md:p-2"
                >
                  <Avatar className="h-7 w-7 md:h-8 md:w-8">
                    <AvatarImage
                      src={`https://mc-heads.net/avatar/${player.name}/32`}
                      alt={player.name}
                    />
                    <AvatarFallback className="bg-primary/20 text-xs text-primary">
                      {player.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-medium text-foreground">{player.name}</p>
                      {player.isOperator && (
                        <Crown className="h-3 w-3 text-warning" title="Operador" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2">
                      <span className="flex items-center gap-0.5 md:gap-1">
                        <Signal className={`h-2.5 w-2.5 md:h-3 md:w-3 ${getPingColor(player.ping)}`} />
                        {player.ping}ms
                      </span>
                      <span className="hidden xs:inline">•</span>
                      <span className="hidden xs:inline">{formatConnectedTime(player.joinedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 md:gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" title="Mensagem">
                      <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive md:h-8 md:w-8"
                      title="Expulsar"
                      onClick={() => handleKick(player.uuid, player.name)}
                      disabled={isKicking}
                    >
                      {isKicking ? (
                        <Spinner className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      ) : (
                        <Ban className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
