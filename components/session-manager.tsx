"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Save, History, Clock, Trash2, MoreHorizontal, Download, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface AnalysisSession {
  id: string
  name: string
  date: string
  dataSnapshot: {
    data: any[]
    columns: string[]
    fileName: string
  }
  activeTab: string
  visualizations?: any[]
  transformations?: any[]
  notes?: string
  tags?: string[]
}

interface SessionManagerProps {
  data: any[]
  columns: string[]
  currentFileName: string
  activeTab: string
  onSessionLoad: (session: AnalysisSession) => void
}

export function SessionManager({ data, columns, currentFileName, activeTab, onSessionLoad }: SessionManagerProps) {
  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [sessionName, setSessionName] = useState("")
  const [includeData, setIncludeData] = useState(true)
  const [includeVisualizations, setIncludeVisualizations] = useState(true)
  const [includeTransformations, setIncludeTransformations] = useState(true)
  const [sessionNotes, setSessionNotes] = useState("")
  const [sessionTags, setSessionTags] = useState("")
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const storedSessions = localStorage.getItem("excel-analyzer-sessions")
    if (storedSessions) {
      try {
        setSessions(JSON.parse(storedSessions))
      } catch (error) {
        console.error("Failed to parse sessions:", error)
      }
    }

    // Set default session name
    setSessionName(`${currentFileName || "Analysis"} - ${format(new Date(), "MMM d, yyyy")}`)
  }, [currentFileName])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !data.length || !columns.length) return

    const autoSaveInterval = setInterval(() => {
      const autoSaveSession: AnalysisSession = {
        id: "autosave",
        name: "Auto-saved Session",
        date: new Date().toISOString(),
        dataSnapshot: {
          data: data.slice(0, 100), // Limit data to prevent localStorage overflow
          columns,
          fileName: currentFileName,
        },
        activeTab,
      }

      localStorage.setItem("excel-analyzer-autosave", JSON.stringify(autoSaveSession))
      setLastAutoSave(new Date().toISOString())
    }, 60000) // Auto-save every minute

    return () => clearInterval(autoSaveInterval)
  }, [autoSaveEnabled, data, columns, currentFileName, activeTab])

  const handleSaveSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: "Session name required",
        description: "Please enter a name for your session",
        variant: "destructive",
      })
      return
    }

    const newSession: AnalysisSession = {
      id: Date.now().toString(),
      name: sessionName,
      date: new Date().toISOString(),
      dataSnapshot: {
        data: includeData ? data.slice(0, 100) : [], // Limit data to prevent localStorage overflow
        columns,
        fileName: currentFileName,
      },
      activeTab,
      notes: sessionNotes,
      tags: sessionTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    if (includeVisualizations) {
      newSession.visualizations = [
        { type: "bar", config: { xAxis: "Category", yAxis: "Revenue" } },
        { type: "line", config: { xAxis: "Date", yAxis: "Sales" } },
      ] // Placeholder for actual visualizations
    }

    if (includeTransformations) {
      newSession.transformations = [
        { type: "normalize", column: "Revenue", newColumn: "NormalizedRevenue" },
        { type: "binning", column: "Age", newColumn: "AgeGroup" },
      ] // Placeholder for actual transformations
    }

    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    localStorage.setItem("excel-analyzer-sessions", JSON.stringify(updatedSessions))

    toast({
      title: "Session saved",
      description: `"${sessionName}" has been saved successfully`,
    })
  }

  const handleLoadSession = (session: AnalysisSession) => {
    onSessionLoad(session)
    toast({
      title: "Session loaded",
      description: `"${session.name}" has been loaded successfully`,
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((session) => session.id !== sessionId)
    setSessions(updatedSessions)
    localStorage.setItem("excel-analyzer-sessions", JSON.stringify(updatedSessions))

    toast({
      title: "Session deleted",
      description: "The session has been deleted successfully",
    })
  }

  const handleExportSessions = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      const sessionsData = JSON.stringify(sessions, null, 2)
      const blob = new Blob([sessionsData], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = "excel-analyzer-sessions.json"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExporting(false)
      toast({
        title: "Sessions exported",
        description: "All sessions have been exported to a JSON file",
      })
    }, 1500)
  }

  const handleImportSessions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSessions = JSON.parse(e.target?.result as string)
        if (Array.isArray(importedSessions)) {
          setSessions([...importedSessions, ...sessions])
          localStorage.setItem("excel-analyzer-sessions", JSON.stringify([...importedSessions, ...sessions]))

          toast({
            title: "Sessions imported",
            description: `Successfully imported ${importedSessions.length} sessions`,
          })
        } else {
          throw new Error("Invalid format")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is invalid",
          variant: "destructive",
        })
      } finally {
        setIsImporting(false)
      }
    }

    reader.onerror = () => {
      toast({
        title: "Import failed",
        description: "An error occurred while reading the file",
        variant: "destructive",
      })
      setIsImporting(false)
    }

    reader.readAsText(file)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a")
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Sessions</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Session Manager</DialogTitle>
            <DialogDescription>
              Save and restore analysis sessions to continue your work later or share with others.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="save" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="save" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Save Session</span>
              </TabsTrigger>
              <TabsTrigger value="load" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Load Session</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="save" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Enter session name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Include in Session</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-data"
                        checked={includeData}
                        onCheckedChange={(checked) => setIncludeData(checked as boolean)}
                      />
                      <Label htmlFor="include-data" className="cursor-pointer">
                        Data snapshot
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-viz"
                        checked={includeVisualizations}
                        onCheckedChange={(checked) => setIncludeVisualizations(checked as boolean)}
                      />
                      <Label htmlFor="include-viz" className="cursor-pointer">
                        Visualizations
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-transform"
                        checked={includeTransformations}
                        onCheckedChange={(checked) => setIncludeTransformations(checked as boolean)}
                      />
                      <Label htmlFor="include-transform" className="cursor-pointer">
                        Transformations
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-notes">Notes (Optional)</Label>
                  <Input
                    id="session-notes"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Add notes about this session"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session-tags">Tags (Optional)</Label>
                  <Input
                    id="session-tags"
                    value={sessionTags}
                    onChange={(e) => setSessionTags(e.target.value)}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-save"
                      checked={autoSaveEnabled}
                      onCheckedChange={(checked) => setAutoSaveEnabled(checked as boolean)}
                    />
                    <Label htmlFor="auto-save" className="cursor-pointer">
                      Enable auto-save
                    </Label>
                  </div>
                  {lastAutoSave && (
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Last auto-save: {formatDate(lastAutoSave)}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSaveSession}>Save Session</Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="load" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Saved Sessions</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="import-sessions"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportSessions}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("import-sessions")?.click()}
                    disabled={isImporting}
                    className="text-xs h-8"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportSessions}
                    disabled={isExporting || sessions.length === 0}
                    className="text-xs h-8"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {sessions.length > 0 ? (
                  <div className="divide-y">
                    {sessions.map((session) => (
                      <div key={session.id} className="p-3 hover:bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{session.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(session.date)} • {session.dataSnapshot.fileName}
                            </p>
                            {session.tags && session.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {session.tags.map((tag, index) => (
                                  <span key={index} className="px-1.5 py-0.5 bg-muted text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadSession(session)}
                              className="h-8"
                            >
                              Load
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleLoadSession(session)}>
                                  Load Session
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {session.notes && <p className="text-sm mt-1">{session.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No saved sessions</p>
                    <p className="text-xs mt-1">Save your current analysis to continue later</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
