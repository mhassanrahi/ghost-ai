"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Download, FileText, Send, Loader2 } from "lucide-react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isThinking?: boolean
}

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
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeRun, setActiveRun] = useState<{ id: string; token: string; messageId: string } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [draft])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const { run } = useRealtimeRun(activeRun?.id, {
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
      run.status === "TIMED_OUT"
    if (!isTerminal) return

    const content =
      run.status === "COMPLETED"
        ? "Your design has been applied to the canvas."
        : "Something went wrong generating the design. Please try again."

    setMessages((prev) =>
      prev.map((m) =>
        m.id === activeRun.messageId ? { ...m, content, isThinking: false } : m
      )
    )
    setActiveRun(null)
  }, [run?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async () => {
    const trimmed = draft.trim()
    if (!trimmed || isSubmitting) return

    const thinkingId = `thinking-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", content: trimmed },
      { id: thinkingId, role: "assistant", content: "Designing…", isThinking: true },
    ])
    setDraft("")
    setIsSubmitting(true)

    try {
      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId, projectId }),
      })
      if (!designRes.ok) throw new Error("Design request failed")
      const { runId } = (await designRes.json()) as { runId: string }

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      })
      if (!tokenRes.ok) throw new Error("Token request failed")
      const { token } = (await tokenRes.json()) as { token: string }

      setActiveRun({ id: runId, token, messageId: thinkingId })
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, content: "Failed to start the design task. Please try again.", isThinking: false }
            : m
        )
      )
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
        <Bot className="h-5 w-5 text-ai-text" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-copy-primary">AI Workspace</p>
          <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
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
        <TabsContent
          value="architect"
          className="m-0 flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 pt-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ai/10">
                  <Bot className="h-6 w-6 text-ai-text" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-copy-primary">
                    Ghost AI Architect
                  </p>
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
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-xs",
                      msg.role === "user"
                        ? "border-2 border-brand/50 bg-accent-dim text-copy-primary"
                        : "border border-surface-border bg-elevated text-ai-text",
                      msg.isThinking && "animate-pulse"
                    )}
                  >
                    {msg.isThinking ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {msg.content}
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-surface-border p-3">
            <div className="flex flex-col gap-2">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your architecture…"
                className="max-h-[160px] min-h-[72px] resize-none border-surface-border bg-elevated text-xs text-copy-primary placeholder:text-copy-faint"
                rows={1}
              />
              <Button
                onClick={() => void sendMessage()}
                disabled={!draft.trim() || isSubmitting || !!activeRun}
                className="h-8 self-end bg-ai px-3 text-xs text-white hover:bg-ai/90"
              >
                <Send className="mr-1 h-3 w-3" />
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
                  Microservices layout with API gateway, three core services,
                  and PostgreSQL data stores.
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
