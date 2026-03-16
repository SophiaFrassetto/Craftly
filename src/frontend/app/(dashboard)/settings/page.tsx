"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, User, Bell, Shield, Palette, Globe } from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@mcmanager.com",
  })

  const [notifications, setNotifications] = useState({
    serverOffline: true,
    playerJoin: false,
    backupComplete: true,
    errors: true,
  })

  const [appearance, setAppearance] = useState({
    theme: "dark",
    language: "pt-BR",
  })

  const [security, setSecurity] = useState({
    twoFactor: false,
  })

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Configurações</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <User className="h-4 w-4 text-primary md:h-5 md:w-5" />
              Perfil
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarImage src="https://mc-heads.net/avatar/Steve/80" alt="Avatar" />
                <AvatarFallback className="bg-primary/20 text-lg text-primary md:text-xl">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <Button variant="outline" size="sm" className="text-xs md:text-sm">
                  Alterar Avatar
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs md:text-sm">Nome</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs md:text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs md:text-sm">Nova Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" className="text-sm" />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para manter a senha atual
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Bell className="h-4 w-4 text-primary md:h-5 md:w-5" />
              Notificações
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure como você deseja ser notificado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Servidor Offline</Label>
                <p className="text-xs text-muted-foreground">
                  Receba alertas quando um servidor ficar offline
                </p>
              </div>
              <Switch
                checked={notifications.serverOffline}
                onCheckedChange={(v) =>
                  setNotifications((prev) => ({ ...prev, serverOffline: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Entrada de Jogadores</Label>
                <p className="text-xs text-muted-foreground">
                  Notifique quando jogadores entrarem no servidor
                </p>
              </div>
              <Switch
                checked={notifications.playerJoin}
                onCheckedChange={(v) =>
                  setNotifications((prev) => ({ ...prev, playerJoin: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Backup Completo</Label>
                <p className="text-xs text-muted-foreground">
                  Receba confirmação quando backups forem concluídos
                </p>
              </div>
              <Switch
                checked={notifications.backupComplete}
                onCheckedChange={(v) =>
                  setNotifications((prev) => ({ ...prev, backupComplete: v }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Erros e Alertas</Label>
                <p className="text-xs text-muted-foreground">
                  Seja notificado sobre erros críticos do servidor
                </p>
              </div>
              <Switch
                checked={notifications.errors}
                onCheckedChange={(v) =>
                  setNotifications((prev) => ({ ...prev, errors: v }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Palette className="h-4 w-4 text-primary md:h-5 md:w-5" />
              Aparência
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Personalize a aparência do painel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Tema</Label>
                <Select
                  value={appearance.theme}
                  onValueChange={(v) =>
                    setAppearance((prev) => ({ ...prev, theme: v }))
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs md:text-sm">
                  <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Idioma
                </Label>
                <Select
                  value={appearance.language}
                  onValueChange={(v) =>
                    setAppearance((prev) => ({ ...prev, language: v }))
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="p-4 pb-2 md:p-6 md:pb-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Shield className="h-4 w-4 text-primary md:h-5 md:w-5" />
              Segurança
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure opções de segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Label className="text-sm">Autenticação em Duas Etapas</Label>
                <p className="text-xs text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Switch
                checked={security.twoFactor}
                onCheckedChange={(v) =>
                  setSecurity((prev) => ({ ...prev, twoFactor: v }))
                }
              />
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-3 md:p-4">
              <h4 className="text-sm font-medium text-foreground">Sessões Ativas</h4>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Você está conectado em 1 dispositivo
              </p>
              <Button variant="outline" size="sm" className="mt-3 text-xs md:text-sm">
                Gerenciar Sessões
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button variant="outline" className="w-full text-sm sm:w-auto">Cancelar</Button>
          <Button className="w-full text-sm sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  )
}
