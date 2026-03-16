"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useMinecraftVersions, useLoaderVersions, useCreateServer } from "@/hooks/use-servers"
import type { LoaderType, Server } from "@/lib/api/types"
import { LOADER_NAMES } from "@/lib/api/mock-data"

interface CreateServerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onServerCreated?: (server: Server) => void
}

const LOADERS: { value: LoaderType; label: string; description: string }[] = [
  { value: "vanilla", label: "Vanilla", description: "Minecraft puro, sem modificacoes" },
  { value: "paper", label: "Paper", description: "Otimizado para performance, suporta plugins" },
  { value: "spigot", label: "Spigot", description: "Popular para plugins, base do Paper" },
  { value: "fabric", label: "Fabric", description: "Leve e modular, para mods modernos" },
  { value: "forge", label: "Forge", description: "Tradicional para mods, grande comunidade" },
  { value: "neoforge", label: "NeoForge", description: "Fork moderno do Forge" },
  { value: "quilt", label: "Quilt", description: "Fork do Fabric com melhorias" },
]

export function CreateServerModal({
  open,
  onOpenChange,
  onServerCreated,
}: CreateServerModalProps) {
  const [name, setName] = useState("")
  const [loader, setLoader] = useState<LoaderType | "">("")
  const [minecraftVersion, setMinecraftVersion] = useState("")
  const [loaderVersion, setLoaderVersion] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(20)
  const [ramRange, setRamRange] = useState([2048, 4096])

  const { versions: mcVersions, isLoading: loadingMcVersions } = useMinecraftVersions()
  const { versions: loaderVersions, isLoading: loadingLoaderVersions } = useLoaderVersions(
    loader ? (loader as LoaderType) : null
  )
  const { createServer, isCreating } = useCreateServer()

  // Filtrar versoes do loader pela versao do Minecraft selecionada
  const filteredLoaderVersions = loaderVersions.filter(
    (v) => !minecraftVersion || v.minecraftVersion === minecraftVersion
  )

  // Reset loader version quando mudar o loader ou versao do minecraft
  useEffect(() => {
    setLoaderVersion("")
  }, [loader, minecraftVersion])

  // Auto-selecionar primeira versao do loader disponivel
  useEffect(() => {
    if (filteredLoaderVersions.length > 0 && !loaderVersion) {
      const stable = filteredLoaderVersions.find((v) => v.stable)
      if (stable) {
        setLoaderVersion(stable.version)
      }
    }
  }, [filteredLoaderVersions, loaderVersion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !loader || !minecraftVersion) return

    try {
      const server = await createServer({
        name,
        loader: loader as LoaderType,
        minecraftVersion,
        loaderVersion: loaderVersion || minecraftVersion,
        minRam: ramRange[0],
        maxRam: ramRange[1],
        maxPlayers,
      })

      onServerCreated?.(server)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar servidor:", error)
    }
  }

  const resetForm = () => {
    setName("")
    setLoader("")
    setMinecraftVersion("")
    setLoaderVersion("")
    setMaxPlayers(20)
    setRamRange([2048, 4096])
  }

  const formatRam = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">Criar Novo Servidor</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Configure as opcoes do seu servidor Minecraft.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-3 md:py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs md:text-sm">
                Nome do Servidor
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Meu Servidor Minecraft"
                required
                className="text-sm"
              />
            </div>

            {/* Loader */}
            <div className="space-y-2">
              <Label htmlFor="loader" className="text-xs md:text-sm">
                Loader / Tipo de Servidor
              </Label>
              <Select value={loader} onValueChange={(v) => setLoader(v as LoaderType)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione o loader" />
                </SelectTrigger>
                <SelectContent>
                  {LOADERS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      <div className="flex flex-col">
                        <span>{l.label}</span>
                        <span className="text-xs text-muted-foreground">{l.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Versao do Minecraft */}
            <div className="space-y-2">
              <Label htmlFor="mcVersion" className="text-xs md:text-sm">
                Versao do Minecraft
              </Label>
              <Select
                value={minecraftVersion}
                onValueChange={setMinecraftVersion}
                disabled={loadingMcVersions}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue
                    placeholder={loadingMcVersions ? "Carregando..." : "Selecione a versao"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {mcVersions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.id} {v.type === "snapshot" && "(Snapshot)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Versao do Loader */}
            {loader && loader !== "vanilla" && (
              <div className="space-y-2">
                <Label htmlFor="loaderVersion" className="text-xs md:text-sm">
                  Versao do {LOADER_NAMES[loader as LoaderType] || loader}
                </Label>
                <Select
                  value={loaderVersion}
                  onValueChange={setLoaderVersion}
                  disabled={loadingLoaderVersions || !minecraftVersion}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue
                      placeholder={
                        loadingLoaderVersions
                          ? "Carregando..."
                          : !minecraftVersion
                            ? "Selecione a versao do Minecraft primeiro"
                            : "Selecione a versao do loader"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLoaderVersions.map((v) => (
                      <SelectItem key={v.version} value={v.version}>
                        {v.version} {v.stable && "(Estavel)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* RAM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs md:text-sm">Memoria RAM</Label>
                <span className="text-xs text-muted-foreground">
                  {formatRam(ramRange[0])} - {formatRam(ramRange[1])}
                </span>
              </div>
              <Slider
                value={ramRange}
                onValueChange={setRamRange}
                min={512}
                max={16384}
                step={512}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {formatRam(ramRange[0])}</span>
                <span>Max: {formatRam(ramRange[1])}</span>
              </div>
            </div>

            {/* Max Players */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxPlayers" className="text-xs md:text-sm">
                  Maximo de Jogadores
                </Label>
                <span className="text-xs text-muted-foreground">{maxPlayers} jogadores</span>
              </div>
              <Slider
                value={[maxPlayers]}
                onValueChange={([v]) => setMaxPlayers(v)}
                min={1}
                max={100}
                step={1}
                className="py-2"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              disabled={isCreating}
              className="w-full text-sm sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name || !loader || !minecraftVersion}
              className="w-full text-sm sm:w-auto"
            >
              {isCreating && <Spinner className="mr-2 h-4 w-4" />}
              {isCreating ? "Criando..." : "Criar Servidor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
