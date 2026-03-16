"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, RotateCcw, AlertCircle } from "lucide-react"
import { useServerConfig } from "@/hooks/use-servers"

interface ServerConfigProps {
  serverId: string
}

export function ServerConfig({ serverId }: ServerConfigProps) {
  const { config: savedConfig, isLoading, error, update, isUpdating, mutate } = useServerConfig(serverId)
  
  const [config, setConfig] = useState({
    motd: "",
    "max-players": 20,
    "view-distance": 10,
    "simulation-distance": 10,
    gamemode: "survival",
    difficulty: "normal",
    pvp: true,
    hardcore: false,
    "white-list": false,
    "online-mode": true,
    "spawn-protection": 16,
    "level-name": "world",
    "server-port": 25565,
    "enable-command-block": false,
    "allow-flight": false,
    "spawn-monsters": true,
    "spawn-animals": true,
    "allow-nether": true,
  })

  useEffect(() => {
    if (savedConfig) {
      setConfig((prev) => ({
        ...prev,
        motd: String(savedConfig["motd"] || ""),
        "max-players": Number(savedConfig["max-players"]) || 20,
        "view-distance": Number(savedConfig["view-distance"]) || 10,
        "simulation-distance": Number(savedConfig["simulation-distance"]) || 10,
        gamemode: String(savedConfig["gamemode"] || "survival"),
        difficulty: String(savedConfig["difficulty"] || "normal"),
        pvp: savedConfig["pvp"] !== false,
        hardcore: savedConfig["hardcore"] === true,
        "white-list": savedConfig["white-list"] === true,
        "online-mode": savedConfig["online-mode"] !== false,
        "spawn-protection": Number(savedConfig["spawn-protection"]) || 16,
        "level-name": String(savedConfig["level-name"] || "world"),
        "server-port": Number(savedConfig["server-port"]) || 25565,
        "enable-command-block": savedConfig["enable-command-block"] === true,
        "allow-flight": savedConfig["allow-flight"] === true,
        "spawn-monsters": savedConfig["spawn-monsters"] !== false,
        "spawn-animals": savedConfig["spawn-animals"] !== false,
        "allow-nether": savedConfig["allow-nether"] !== false,
      }))
    }
  }, [savedConfig])

  const handleChange = (key: string, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      await update(config)
      mutate()
    } catch (e) {
      console.error("Erro ao salvar configuracoes:", e)
    }
  }

  const handleReset = () => {
    if (savedConfig) {
      setConfig((prev) => ({
        ...prev,
        motd: String(savedConfig["motd"] || ""),
        "max-players": Number(savedConfig["max-players"]) || 20,
        "view-distance": Number(savedConfig["view-distance"]) || 10,
        gamemode: String(savedConfig["gamemode"] || "survival"),
        difficulty: String(savedConfig["difficulty"] || "normal"),
        pvp: savedConfig["pvp"] !== false,
        hardcore: savedConfig["hardcore"] === true,
        "white-list": savedConfig["white-list"] === true,
        "online-mode": savedConfig["online-mode"] !== false,
        "spawn-protection": Number(savedConfig["spawn-protection"]) || 16,
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Carregando configuracoes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground">Erro ao carregar configuracoes</p>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
          <CardTitle className="text-base md:text-lg">Configuracoes Gerais</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Configure as opcoes principais do servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="levelName" className="text-xs md:text-sm">Nome do Mundo</Label>
              <Input
                id="levelName"
                value={config["level-name"]}
                onChange={(e) => handleChange("level-name", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serverPort" className="text-xs md:text-sm">Porta do Servidor</Label>
              <Input
                id="serverPort"
                type="number"
                value={config["server-port"]}
                onChange={(e) => handleChange("server-port", parseInt(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className="text-xs md:text-sm">Maximo de Jogadores</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={config["max-players"]}
                onChange={(e) => handleChange("max-players", parseInt(e.target.value))}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spawnProtection" className="text-xs md:text-sm">Protecao de Spawn</Label>
              <Input
                id="spawnProtection"
                type="number"
                value={config["spawn-protection"]}
                onChange={(e) => handleChange("spawn-protection", parseInt(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motd" className="text-xs md:text-sm">Mensagem do Dia (MOTD)</Label>
            <Textarea
              id="motd"
              value={config.motd}
              onChange={(e) => handleChange("motd", e.target.value)}
              rows={2}
              className="text-sm"
              placeholder="Bem-vindo ao servidor!"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gamemode" className="text-xs md:text-sm">Modo de Jogo</Label>
              <Select
                value={config.gamemode}
                onValueChange={(v) => handleChange("gamemode", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="survival">Survival</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="spectator">Spectator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-xs md:text-sm">Dificuldade</Label>
              <Select
                value={config.difficulty}
                onValueChange={(v) => handleChange("difficulty", v)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
          <CardTitle className="text-base md:text-lg">Configuracoes de Mundo</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Ajuste as configuracoes relacionadas ao mundo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="viewDistance" className="text-xs md:text-sm">Distancia de Renderizacao</Label>
              <Input
                id="viewDistance"
                type="number"
                value={config["view-distance"]}
                onChange={(e) => handleChange("view-distance", parseInt(e.target.value))}
                min="2"
                max="32"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="simulationDistance" className="text-xs md:text-sm">Distancia de Simulacao</Label>
              <Input
                id="simulationDistance"
                type="number"
                value={config["simulation-distance"]}
                onChange={(e) => handleChange("simulation-distance", parseInt(e.target.value))}
                min="2"
                max="32"
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
          <CardTitle className="text-base md:text-lg">Opcoes de Gameplay</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Ative ou desative funcionalidades do servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="pvp" className="text-sm">PvP</Label>
              <p className="text-xs text-muted-foreground">
                Permitir combate entre jogadores
              </p>
            </div>
            <Switch
              id="pvp"
              checked={config.pvp}
              onCheckedChange={(v) => handleChange("pvp", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="hardcore" className="text-sm">Modo Hardcore</Label>
              <p className="text-xs text-muted-foreground">
                Jogadores sao banidos ao morrer
              </p>
            </div>
            <Switch
              id="hardcore"
              checked={config.hardcore}
              onCheckedChange={(v) => handleChange("hardcore", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="whitelist" className="text-sm">Whitelist</Label>
              <p className="text-xs text-muted-foreground">
                Apenas jogadores na lista podem entrar
              </p>
            </div>
            <Switch
              id="whitelist"
              checked={config["white-list"]}
              onCheckedChange={(v) => handleChange("white-list", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="onlineMode" className="text-sm">Modo Online</Label>
              <p className="text-xs text-muted-foreground">
                Verificar contas Minecraft Premium
              </p>
            </div>
            <Switch
              id="onlineMode"
              checked={config["online-mode"]}
              onCheckedChange={(v) => handleChange("online-mode", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="allowFlight" className="text-sm">Permitir Voo</Label>
              <p className="text-xs text-muted-foreground">
                Permitir jogadores voarem sem serem kickados
              </p>
            </div>
            <Switch
              id="allowFlight"
              checked={config["allow-flight"]}
              onCheckedChange={(v) => handleChange("allow-flight", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="commandBlock" className="text-sm">Command Blocks</Label>
              <p className="text-xs text-muted-foreground">
                Habilitar blocos de comando
              </p>
            </div>
            <Switch
              id="commandBlock"
              checked={config["enable-command-block"]}
              onCheckedChange={(v) => handleChange("enable-command-block", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="allowNether" className="text-sm">Nether</Label>
              <p className="text-xs text-muted-foreground">
                Permitir acesso ao Nether
              </p>
            </div>
            <Switch
              id="allowNether"
              checked={config["allow-nether"]}
              onCheckedChange={(v) => handleChange("allow-nether", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="spawnMonsters" className="text-sm">Monstros</Label>
              <p className="text-xs text-muted-foreground">
                Spawnar monstros hostis
              </p>
            </div>
            <Switch
              id="spawnMonsters"
              checked={config["spawn-monsters"]}
              onCheckedChange={(v) => handleChange("spawn-monsters", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="spawnAnimals" className="text-sm">Animais</Label>
              <p className="text-xs text-muted-foreground">
                Spawnar animais passivos
              </p>
            </div>
            <Switch
              id="spawnAnimals"
              checked={config["spawn-animals"]}
              onCheckedChange={(v) => handleChange("spawn-animals", v)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button 
          variant="outline" 
          onClick={handleReset} 
          disabled={isUpdating}
          className="w-full text-sm sm:w-auto"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Resetar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isUpdating}
          className="w-full text-sm sm:w-auto"
        >
          {isUpdating ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isUpdating ? "Salvando..." : "Salvar Configuracoes"}
        </Button>
      </div>
    </div>
  )
}
