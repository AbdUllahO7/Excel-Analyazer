"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Clock, FileSpreadsheet, Trash2 } from "lucide-react"
import { format } from "date-fns"

export interface RecentFile {
  id: string
  name: string
  date: string
  columns: string[]
  data: any[]
}

interface RecentFilesProps {
  onSelectFile: (file: RecentFile) => void
  className?: string
}

export function RecentFiles({ onSelectFile, className }: RecentFilesProps) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])

  useEffect(() => {
    // Load recent files from localStorage
    const storedFiles = localStorage.getItem("excel-analyzer-recent-files")
    if (storedFiles) {
      try {
        setRecentFiles(JSON.parse(storedFiles))
      } catch (error) {
        console.error("Failed to parse recent files:", error)
        // If parsing fails, clear the corrupted data
        localStorage.removeItem("excel-analyzer-recent-files")
      }
    }
  }, [])

  const handleClearRecentFiles = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.removeItem("excel-analyzer-recent-files")
    setRecentFiles([])
  }

  const handleRemoveFile = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    const updatedFiles = recentFiles.filter((file) => file.id !== fileId)
    setRecentFiles(updatedFiles)
    localStorage.setItem("excel-analyzer-recent-files", JSON.stringify(updatedFiles))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`flex items-center gap-2 ${className}`}>
          <Clock className="h-4 w-4" />
          <span className="hidden md:inline">Recent Files</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Recent Files</span>
          {recentFiles.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleClearRecentFiles}
              title="Clear all recent files"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentFiles.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">No recent files</div>
        ) : (
          recentFiles.map((file) => (
            <DropdownMenuItem
              key={file.id}
              onClick={() => onSelectFile(file)}
              className="flex items-center justify-between gap-2 py-2"
            >
              <div className="flex items-center gap-2 truncate">
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <div className="flex flex-col">
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(file.date), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleRemoveFile(e, file.id)}
                title="Remove from recent files"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
