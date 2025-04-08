"use client"

import { useState } from "react"
import { Copy, Link, Mail, Share2, Users, Lock, Globe, Check } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ShareDialogProps {
  data: any[]
  columns: string[]
  currentFileName: string
  currentTab: string
}

export function ShareDialog({ data, columns, currentFileName, currentTab }: ShareDialogProps) {
  const [shareType, setShareType] = useState("link")
  const [permission, setPermission] = useState("view")
  const [copied, setCopied] = useState(false)
  const [emailAddresses, setEmailAddresses] = useState("")
  const [message, setMessage] = useState("")
  const [expiryEnabled, setExpiryEnabled] = useState(false)
  const [expiryDays, setExpiryDays] = useState("7")
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")

  // Generate a unique share ID based on current data and settings
  const generateShareId = () => {
    const timestamp = Date.now()
    const randomPart = Math.random().toString(36).substring(2, 10)
    return `excel-${timestamp}-${randomPart}`.substring(0, 20)
  }

  const shareId = generateShareId()
  const shareUrl = `https://excel-analyzer.example.com/shared/${shareId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this link with others",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    // In a real app, this would send the share data to a backend
    // For now, we'll just show a success message

    const shareData = {
      id: shareId,
      data: data.slice(0, 100), // Limit data for demo purposes
      columns,
      fileName: currentFileName,
      activeTab: currentTab,
      permission,
      expiryDays: expiryEnabled ? Number.parseInt(expiryDays) : null,
      passwordProtected,
      createdAt: new Date().toISOString(),
    }

    console.log("Sharing data:", shareData)

    if (shareType === "email" && emailAddresses) {
      toast({
        title: "Share link sent",
        description: `Share link has been sent to ${emailAddresses.split(",").length} recipients`,
      })
    } else {
      toast({
        title: "Share link created",
        description: "Your analysis is now ready to share",
      })
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Share Analysis</DialogTitle>
            <DialogDescription>Share your analysis with others or generate a link for collaboration.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="link" onValueChange={setShareType} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span>Share Link</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Input
                  id="emails"
                  placeholder="Enter email addresses separated by commas"
                  value={emailAddresses}
                  onChange={(e) => setEmailAddresses(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Permission Settings</Label>
              <RadioGroup value={permission} onValueChange={setPermission} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>View only</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>Can edit</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="expiry-toggle" className="flex items-center gap-2 cursor-pointer">
                  <span>Set expiry date</span>
                </Label>
                <Switch id="expiry-toggle" checked={expiryEnabled} onCheckedChange={setExpiryEnabled} />
              </div>

              {expiryEnabled && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-20"
                  />
                  <span>days</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-toggle" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  <span>Password protection</span>
                </Label>
                <Switch id="password-toggle" checked={passwordProtected} onCheckedChange={setPasswordProtected} />
              </div>

              {passwordProtected && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button onClick={handleShare}>{shareType === "email" ? "Send" : "Create Share Link"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
