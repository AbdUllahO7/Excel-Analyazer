"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Collaborator {
  id: string
  name: string
  initials: string
  avatar?: string
  status: "active" | "idle" | "offline"
  lastActive?: string
  currentView?: string
}

// Sample collaborators data
const sampleCollaborators: Collaborator[] = [
  {
    id: "user1",
    name: "Alex Johnson",
    initials: "AJ",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "active",
    currentView: "visualize",
  },
  {
    id: "user2",
    name: "Sam Taylor",
    initials: "ST",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "active",
    currentView: "explore",
  },
  {
    id: "user3",
    name: "Jamie Smith",
    initials: "JS",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "idle",
    lastActive: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
  },
]

interface CollaborationIndicatorProps {
  currentTab: string
}

export function CollaborationIndicator({ currentTab }: CollaborationIndicatorProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(sampleCollaborators)
  const [showTooltip, setShowTooltip] = useState(false)

  // Simulate collaborator status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) => {
        return prev.map((collaborator) => {
          // Randomly update status
          if (Math.random() > 0.8) {
            if (collaborator.status === "active") {
              return {
                ...collaborator,
                status: "idle",
                lastActive: new Date().toISOString(),
              }
            } else if (collaborator.status === "idle") {
              return {
                ...collaborator,
                status: "active",
                currentView: ["explore", "visualize", "clean", "transform"][Math.floor(Math.random() * 4)],
              }
            }
          }

          // Randomly update current view for active users
          if (collaborator.status === "active" && Math.random() > 0.7) {
            return {
              ...collaborator,
              currentView: ["explore", "visualize", "clean", "transform"][Math.floor(Math.random() * 4)],
            }
          }

          return collaborator
        })
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const activeCollaborators = collaborators.filter((c) => c.status === "active" || c.status === "idle")

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
        <TooltipTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowTooltip(!showTooltip)}>
            <Users className="h-4 w-4" />
            <span>{activeCollaborators.length} online</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="w-80 p-0">
          <div className="p-4">
            <h3 className="font-medium mb-2">Collaborators</h3>
            <div className="space-y-3">
              {activeCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                        <AvatarFallback>{collaborator.initials}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                          collaborator.status === "active" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.status === "active"
                          ? `Viewing: ${collaborator.currentView}`
                          : `Idle for ${Math.floor((Date.now() - new Date(collaborator.lastActive || "").getTime()) / 60000)} min`}
                      </p>
                    </div>
                  </div>
                  {collaborator.currentView === currentTab && collaborator.status === "active" && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Same view
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                All changes are automatically saved and synced in real-time
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
