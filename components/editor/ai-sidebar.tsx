"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Download, FileText, Send, Loader2, AlertCircle } from "lucide-react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useStorage, useMutation, useSelf } from "@liveblocks/react"
import type { designAgentTask } from "@/trigger/design-agent"
import { AiStatusFeedPayloadSchema, AiChatMessageSchema, type AiChatMessage } from "@/types/tasks"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  roomId: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

export function AiSidebar({ isOpen, onClose, projectId, roomId }: AiSidebarProps) {
  const [draft, setDraft] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [activeRun, setActiveRun] = useState<{ id: string; token: string } | null>(null)
  const [thinkingMessage, setThinkingMessage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const senderName = useSelf((me) => me.info?.name ?? "You")

  // Shared AI status feed
  const rawFeed = useStorage((root) => root["ai-status-feed"])
  const feedResult = rawFeed != null ? AiStatusFeedPayloadSchema.safeParse(rawFeed) : null
  const sharedFeed = feedResult?.success ? feedResult.data : null
  const isFeedActive = sharedFeed?.status === "start" || sharedFeed?.status === "processing"

  // Shared chat feed — validated before rendering
  const rawMessages = useStorage((root) => root["ai-chat"])
  const messages: AiChatMessage[] = rawMessages
    ? rawMessages.flatMap((m) => {
        const result = AiChatMessageSchema.safeParse(m)
        return result.success ? [result.data] : []
      })
    : []

  const isGenerating = isSubmitting || !!activeRun || isFeedActive

  const pushMessage = useMutation(({ storage }, message: AiChatMessage) => {
    storage.get("ai-chat").push(message)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinkingMessage])

  const { run, error: runError } = useRealtimeRun<typeof designAgentTask>(activeRun?.id, {
    accessToken: activeRun?.token ?? "",
    enabled: !!activeRun,
    stopOnCompletion: true,
  })

  useEffect(() => {
    if (!run || !activeRun) return
    const isTerminal =
      run.status === "COMPLETED" ||
      run.status === "FAILED" ||
      run.status === "CANCELED" ||
      run.status === "CRASHED" ||
      run.status === "SYSTEM_FAILURE" ||
      run.status === "EXPIRED" ||
      run.status === "TIMED_OUT" ||
      run.status === "PENDING_VERSION"
    if (!isTerminal) return

    pushMessage({
      id: `ai-${Date.now()}`,
      sender: "Ghost AI",
      role: "assistant",
      content:
        run.status === "COMPLETED"
          ? "Your design has been applied to the canvas."
          : "Something went wrong generating the design. Please try again.",
      timestamp: Date.now(),
    })
    setThinkingMessage(false)
    setActiveRun(null)
  }, [run?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!runError || !activeRun) return
    pushMessage({
      id: `ai-err-${Date.now()}`,
      sender: "Ghost AI",
      role: "assistant",
      content: "Connection error. Please try again.",
      timestamp: Date.now(),
    })
    setThinkingMessage(false)
    setActiveRun(null)
  }, [runError]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async () => {
    const trimmed = draft.trim()
    if (!trimmed || isGenerating) return

    setSendError(null)

    try {
      pushMessage({
        id: `user-${Date.now()}`,
        sender: senderName ?? "You",
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      })
    } catch {
      setSendError("Failed to send. Please try again.")
      return
    }

    setDraft("")
    setThinkingMessage(true)
    setIsSubmitting(true)

    try {
      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId, projectId }),
      })
      if (!designRes.ok) throw new Error("Design request failed")
      const { runId, publicToken } = (await designRes.json()) as {
        runId: string
        publicToken: string
      }

      setActiveRun({ id: runId, token: publicToken })
    } catch {
      pushMessage({
        id: `ai-fail-${Date.now()}`,
        sender: "Ghost AI",
        role: "assistant",
        content: "Failed to start the design task. Please try again.",
        timestamp: Date.now(),
      })
      setThinkingMessage(false)
      setSendError("AI request failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const handleStarterPrompt = (prompt: string) => {
    setDraft(prompt)
    textareaRef.current?.focus()
  }

  const hasMessages = messages.length > 0 || thinkingMessage

  return (
    <aside
      className={cn(
        "fixed right-0 top-12 z-10 flex h-[calc(100vh-3rem)] w-80 flex-col",
        "border-l border-surface-border bg-base/95 shadow-xl backdrop-blur-md",
        "transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-surface-border px-4 py-3">
        <div className="relative">
          <Bot className="h-5 w-5 text-ai-text" />
          {isFeedActive && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-ai" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-copy-primary">AI Workspace</p>
          {isFeedActive ? (
            <p className="flex items-center gap-1 text-xs text-ai-text">
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
              {sharedFeed?.text ?? "AI is working…"}
            </p>
          ) : (
            <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-copy-muted hover:text-copy-primary"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="h-auto shrink-0 gap-1 rounded-none border-b border-surface-border bg-transparent px-4 py-0">
          <TabsTrigger
            value="architect"
            className="rounded-lg px-3 py-2 text-xs data-[state=active]:bg-ai/10 data-[state=active]:text-ai-text data-[state=inactive]:text-copy-muted"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-lg px-3 py-2 text-xs data-[state=active]:bg-ai/10 data-[state=active]:text-ai-text data-[state=inactive]:text-copy-muted"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        {/* AI Architect tab */}
        <TabsContent value="architect" className="m-0 flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!hasMessages ? (
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai/10">
                  <Bot className="h-6 w-6 text-ai-text" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-copy-primary">Ghost AI Architect</p>
                  <p className="mt-1 text-xs text-copy-muted">
                    Describe your system and I&apos;ll help design it
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleStarterPrompt(prompt)}
                      className="rounded-xl bg-subtle px-3 py-2 text-left text-xs text-ai-text transition-colors hover:bg-elevated"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {thinkingMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-xl border border-surface-border bg-elevated px-3 py-2 text-xs text-ai-text">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Designing…
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {sendError && (
            <div className="flex shrink-0 items-center gap-2 border-t border-surface-border px-3 py-2 text-xs text-error">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {sendError}
            </div>
          )}

          {/* Status strip — visible only while AI is generating */}
          {isFeedActive && (
            <div className="flex shrink-0 items-center gap-2 border-t border-surface-border bg-base px-3 py-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
              <span className="truncate text-xs text-accent-green">
                {sharedFeed?.text ?? "AI is working…"}
              </span>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 border-t border-surface-border p-3">
            <div className="flex flex-col gap-2">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isFeedActive && !isSubmitting
                    ? "AI is working on the canvas…"
                    : "Describe your architecture…"
                }
                disabled={isGenerating}
                className="max-h-[160px] min-h-[72px] resize-none border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-faint disabled:opacity-50"
                rows={1}
              />
              <Button
                onClick={() => void sendMessage()}
                disabled={!draft.trim() || isGenerating}
                className="h-8 self-end bg-accent-green px-3 text-xs text-base hover:bg-accent-green/90 disabled:opacity-40"
              >
                {isSubmitting || !!activeRun ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-1 h-3 w-3" />
                )}
                Send
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Specs tab */}
        <TabsContent
          value="specs"
          className="m-0 flex flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          <Button className="h-9 w-full bg-ai text-xs text-white hover:bg-ai/90">
            Generate Spec
          </Button>
          <div className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ai/10">
                <FileText className="h-4 w-4 text-ai-text" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-copy-primary">
                  Architecture Spec v1
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-copy-muted">
                  Microservices layout with API gateway, three core services, and PostgreSQL data
                  stores.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-8 w-full border-surface-border text-xs text-copy-muted"
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

function ChatMessage({ message }: { message: AiChatMessage }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] text-copy-faint">{message.sender}</span>
        <span className="text-[10px] text-copy-faint">{time}</span>
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-xs",
          message.role === "user"
            ? "bg-accent-green text-base font-medium"
            : "border border-surface-border bg-elevated text-ai-text"
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
