"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Folder,
  File,
  FileText,
  FileCode,
  Image,
  ChevronRight,
  ChevronDown,
  Upload,
  FolderPlus,
  FilePlus,
  Download,
  Trash2,
  Pencil,
  Home,
  ArrowLeft,
  AlertCircle,
} from "lucide-react"
import { useFiles } from "@/hooks/use-servers"
import * as api from "@/lib/api/client"
import type { ServerFile } from "@/lib/api/types"

interface FileManagerProps {
  serverId: string
}

function getFileIcon(item: ServerFile) {
  if (item.type === "folder") {
    return Folder
  }
  const ext = item.extension?.toLowerCase() || item.name.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "yml":
    case "yaml":
    case "json":
    case "properties":
      return FileCode
    case "txt":
    case "log":
      return FileText
    case "png":
    case "jpg":
    case "gif":
      return Image
    default:
      return File
  }
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileTreeItemProps {
  item: ServerFile
  level: number
  selectedPath: string | null
  expandedPaths: Set<string>
  onSelect: (item: ServerFile) => void
  onToggle: (path: string) => void
  onDelete: (item: ServerFile) => void
  onRename: (item: ServerFile) => void
}

function FileTreeItem({
  item,
  level,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle,
  onDelete,
  onRename,
}: FileTreeItemProps) {
  const Icon = getFileIcon(item)
  const isExpanded = expandedPaths.has(item.path)
  const isSelected = selectedPath === item.path

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-secondary md:text-sm ${
              isSelected ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => {
              onSelect(item)
              if (item.type === "folder") {
                onToggle(item.path)
              }
            }}
          >
            {item.type === "folder" && (
              <span className="shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </span>
            )}
            {item.type !== "folder" && <span className="w-3.5" />}
            <Icon
              className={`h-3.5 w-3.5 shrink-0 ${
                item.type === "folder" ? "text-warning" : "text-muted-foreground"
              }`}
            />
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            {item.size && (
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                {formatFileSize(item.size)}
              </span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRename(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            Renomear
          </ContextMenuItem>
          <ContextMenuItem>
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export function FileManager({ serverId }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/")
  const { files, isLoading, error, mutate } = useFiles(serverId, currentPath)
  
  const [selectedFile, setSelectedFile] = useState<ServerFile | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mobileView, setMobileView] = useState<"tree" | "preview">("tree")
  const [pathHistory, setPathHistory] = useState<string[]>(["/"])

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const handleSelect = async (item: ServerFile) => {
    setSelectedFile(item)
    
    if (item.type === "file") {
      setMobileView("preview")
      setLoadingContent(true)
      const result = await api.readFile(serverId, item.path)
      if (result.success) {
        setFileContent(result.data)
      } else {
        setFileContent(null)
      }
      setLoadingContent(false)
    } else {
      setFileContent(null)
    }
  }

  const handleEdit = () => {
    if (fileContent !== null) {
      setEditContent(fileContent)
      setEditDialogOpen(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedFile) return
    
    setIsSaving(true)
    const result = await api.writeFile(serverId, selectedFile.path, editContent)
    if (result.success) {
      setFileContent(editContent)
      setEditDialogOpen(false)
    }
    setIsSaving(false)
  }

  const handleDelete = async (item: ServerFile) => {
    if (!confirm(`Tem certeza que deseja excluir ${item.name}?`)) return
    
    const result = await api.deleteFile(serverId, item.path)
    if (result.success) {
      mutate()
      if (selectedFile?.path === item.path) {
        setSelectedFile(null)
        setFileContent(null)
      }
    }
  }

  const navigateToPath = (path: string) => {
    setCurrentPath(path)
    setPathHistory((prev) => [...prev, path])
  }

  const goBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory]
      newHistory.pop()
      const previousPath = newHistory[newHistory.length - 1]
      setCurrentPath(previousPath)
      setPathHistory(newHistory)
    }
  }

  const goHome = () => {
    setCurrentPath("/")
    setPathHistory(["/"])
  }

  const canEdit = selectedFile?.type === "file" && fileContent !== null

  const pathParts = currentPath.split("/").filter(Boolean)

  return (
    <div className="flex h-[500px] flex-col gap-4 md:h-[600px] lg:flex-row">
      {/* File Tree - Hidden on mobile when viewing preview */}
      <Card className={`border-border bg-card lg:w-1/3 ${mobileView === "preview" ? "hidden lg:block" : ""}`}>
        <CardHeader className="p-3 pb-2 md:p-4 md:pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg">Arquivos</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" title="Upload">
                <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" title="Nova Pasta">
                <FolderPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" title="Novo Arquivo">
                <FilePlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1"
              onClick={goHome}
            >
              <Home className="h-3 w-3" />
            </Button>
            {pathParts.length > 0 && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate">{pathParts.join("/")}</span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-[380px] items-center justify-center md:h-[480px]">
              <Spinner className="h-6 w-6" />
            </div>
          ) : error ? (
            <div className="flex h-[380px] flex-col items-center justify-center gap-3 md:h-[480px]">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">Erro ao carregar arquivos</p>
              <Button variant="outline" size="sm" onClick={() => mutate()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[380px] px-2 pb-2 md:h-[480px]">
              {files.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum arquivo encontrado
                </p>
              ) : (
                files.map((file) => (
                  <FileTreeItem
                    key={file.path}
                    item={file}
                    level={0}
                    selectedPath={selectedFile?.path || null}
                    expandedPaths={expandedPaths}
                    onSelect={handleSelect}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onRename={() => {}}
                  />
                ))
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Preview Panel - Full width on mobile when viewing preview */}
      <Card className={`flex-1 border-border bg-card ${mobileView === "tree" ? "hidden lg:block" : ""}`}>
        <CardHeader className="p-3 pb-2 md:p-4 md:pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 lg:hidden"
                onClick={() => setMobileView("tree")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="truncate text-base md:text-lg">
                {selectedFile ? selectedFile.name : "Selecione um arquivo"}
              </CardTitle>
            </div>
            {canEdit && (
              <Button size="sm" onClick={handleEdit} className="shrink-0 text-xs md:text-sm">
                <Pencil className="mr-1.5 h-3.5 w-3.5 md:mr-2 md:h-4 md:w-4" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          {loadingContent ? (
            <div className="flex h-[380px] items-center justify-center md:h-[480px]">
              <Spinner className="h-6 w-6" />
            </div>
          ) : fileContent !== null ? (
            <ScrollArea className="h-[380px] md:h-[480px]">
              <pre className="rounded-lg bg-secondary p-3 font-mono text-xs text-foreground md:p-4 md:text-sm">
                {fileContent}
              </pre>
            </ScrollArea>
          ) : selectedFile?.type === "folder" ? (
            <div className="flex h-[380px] flex-col items-center justify-center text-muted-foreground md:h-[480px]">
              <Folder className="mb-2 h-12 w-12 text-warning/50 md:h-16 md:w-16" />
              <p className="text-sm md:text-base">Pasta selecionada</p>
              <p className="text-xs md:text-sm">{selectedFile.name}</p>
            </div>
          ) : selectedFile ? (
            <div className="flex h-[380px] flex-col items-center justify-center text-muted-foreground md:h-[480px]">
              <File className="mb-2 h-12 w-12 md:h-16 md:w-16" />
              <p className="text-sm md:text-base">Visualizacao nao disponivel</p>
              <p className="text-xs md:text-sm">{formatFileSize(selectedFile.size)}</p>
            </div>
          ) : (
            <div className="flex h-[380px] flex-col items-center justify-center text-muted-foreground md:h-[480px]">
              <FileText className="mb-2 h-12 w-12 md:h-16 md:w-16" />
              <p className="text-sm md:text-base">Selecione um arquivo para visualizar</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Editar {selectedFile?.name}</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Faca alteracoes no arquivo e salve quando terminar.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="h-[300px] font-mono text-xs md:h-[400px] md:text-sm"
          />
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving && <Spinner className="mr-2 h-4 w-4" />}
              {isSaving ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
