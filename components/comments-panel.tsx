"use client"

import { useState } from "react"
import { MessageSquare, Send, ThumbsUp, ReplyIcon, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Comment {
  id: string
  text: string
  author: {
    name: string
    avatar?: string
    initials: string
  }
  timestamp: string
  likes: number
  replies: Reply[]
  elementId?: string
  resolved?: boolean
}

interface Reply {
  id: string
  text: string
  author: {
    name: string
    avatar?: string
    initials: string
  }
  timestamp: string
}

interface CommentsProps {
  currentTab: string
}

// Sample user data
const currentUser = {
  name: "Current User",
  initials: "CU",
  avatar: "/placeholder.svg?height=40&width=40",
}

// Sample comments data
const sampleComments: Comment[] = [
  {
    id: "comment1",
    text: "I noticed an interesting trend in the sales data. The Q3 numbers show a significant increase compared to previous quarters.",
    author: {
      name: "Alex Johnson",
      initials: "AJ",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likes: 2,
    replies: [
      {
        id: "reply1",
        text: "Good observation! This aligns with our marketing campaign that started in July.",
        author: {
          name: "Sam Taylor",
          initials: "ST",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      },
    ],
    elementId: "chart1",
  },
  {
    id: "comment2",
    text: "There are some outliers in the customer demographics data that might be skewing our analysis. We should consider removing them or analyzing them separately.",
    author: {
      name: "Jamie Smith",
      initials: "JS",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likes: 5,
    replies: [],
    elementId: "table1",
  },
  {
    id: "comment3",
    text: "The correlation between customer age and purchase frequency is weaker than we expected. We might need to revise our targeting strategy.",
    author: {
      name: "Morgan Lee",
      initials: "ML",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    likes: 3,
    replies: [
      {
        id: "reply2",
        text: "I agree. Let's look at other demographic factors that might have stronger correlations.",
        author: {
          name: "Alex Johnson",
          initials: "AJ",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        timestamp: new Date(Date.now() - 158400000).toISOString(), // 1 day and 20 hours ago
      },
      {
        id: "reply3",
        text: "We should also consider seasonal variations in this analysis.",
        author: currentUser,
        timestamp: new Date(Date.now() - 144000000).toISOString(), // 1 day and 16 hours ago
      },
    ],
    elementId: "chart2",
    resolved: true,
  },
]

export function CommentsPanel({ currentTab }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Filter comments based on active tab
  const filteredComments = comments.filter((comment) => {
    if (activeTab === "all") return true
    if (activeTab === "resolved") return comment.resolved
    if (activeTab === "unresolved") return !comment.resolved
    return true
  })

  // Count unresolved comments
  const unresolvedCount = comments.filter((comment) => !comment.resolved).length

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment${Date.now()}`,
      text: newComment,
      author: currentUser,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
      elementId: `element-${currentTab}-${Math.floor(Math.random() * 1000)}`,
    }

    setComments([comment, ...comments])
    setNewComment("")
  }

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return

    const reply: Reply = {
      id: `reply${Date.now()}`,
      text: replyText,
      author: currentUser,
      timestamp: new Date().toISOString(),
    }

    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    )

    setReplyingTo(null)
    setReplyText("")
  }

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment)),
    )
  }

  const handleResolveComment = (commentId: string) => {
    setComments(
      comments.map((comment) => (comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment)),
    )
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId))
  }

  const handleEditComment = (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId)
    if (comment) {
      setEditingComment(commentId)
      setEditText(comment.text)
    }
  }

  const handleSaveEdit = (commentId: string) => {
    if (!editText.trim()) return

    setComments(comments.map((comment) => (comment.id === commentId ? { ...comment, text: editText } : comment)))

    setEditingComment(null)
    setEditText("")
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
          {unresolvedCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
            >
              {unresolvedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments & Annotations</span>
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <span>All</span>
                <Badge variant="secondary">{comments.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unresolved" className="flex items-center gap-2">
                <span>Unresolved</span>
                <Badge variant="secondary">{unresolvedCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <span>Resolved</span>
                <Badge variant="secondary">{comments.length - unresolvedCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <TabsContent value="all" className="mt-0 space-y-4">
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <div key={comment.id} className={`border rounded-lg p-4 ${comment.resolved ? "bg-muted/30" : ""}`}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                            {comment.resolved && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleResolveComment(comment.id)}>
                                {comment.resolved ? "Mark as Unresolved" : "Mark as Resolved"}
                              </DropdownMenuItem>
                              {comment.author.name === currentUser.name && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditComment(comment.id)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-600"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {editingComment === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingComment(null)}>
                                Cancel
                              </Button>
                              <Button size="sm" onClick={() => handleSaveEdit(comment.id)}>
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">{comment.text}</p>
                        )}

                        <div className="flex items-center gap-4 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-muted-foreground"
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                            <span className="text-xs">{comment.likes > 0 ? comment.likes : "Like"}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-muted-foreground"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            <ReplyIcon className="mr-1 h-3.5 w-3.5" />
                            <span className="text-xs">Reply</span>
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="mt-3 space-y-3 pl-6 border-l">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                                  <AvatarFallback>{reply.author.initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium">{reply.author.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatTimestamp(reply.timestamp)}</p>
                                  </div>
                                  <p className="text-sm">{reply.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply input */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 pl-6 border-l">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.initials}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <Textarea
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="min-h-[80px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                                    Cancel
                                  </Button>
                                  <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>No comments yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unresolved" className="mt-0 space-y-4">
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    {/* Same comment structure as above */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleResolveComment(comment.id)}>
                            Resolve
                          </Button>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No unresolved comments</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="mt-0 space-y-4">
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4 bg-muted/30">
                    {/* Same comment structure as above */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Resolved
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleResolveComment(comment.id)}>
                            Unresolve
                          </Button>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No resolved comments</p>
                </div>
              )}
            </TabsContent>
          </div>

          <div className="border-t p-4 mt-auto">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Comment</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
