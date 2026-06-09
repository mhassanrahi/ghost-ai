"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, X, Download, FileText, Send, Loader2, AlertCircle } from "lucide-react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useStorage, useMutation, useSelf } from "@liveblocks/react"
import type { designAgentTask } from "@/trigger/design-agent"
import type { generateSpecTask } from "@/trigger/generate-spec"
import { AiStatusFeedPayloadSchema, AiChatMessageSchema, type AiChatMessage } from "@/types/tasks"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SpecPreviewModal } from "@/components/editor/spec-preview-modal"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  roomId: string
  getCanvasState?: () => { nodes: unknown[]; edges: unknown[] }
}

interface ProjectSpec {
  id: string
  filePath: string
  createdAt: string
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

function getSpecFilename(filePath: string): string {
  try {
    const pathname = new URL(filePath).pathname
    return pathname.split("/").pop() ?? "spec.md"
  } catch {
    return filePath.split("/").pop() ?? "spec.md"
  }
}

export function AiSidebar({ isOpen, onClose, projectId, roomId, getCanvasState }: AiSidebarProps) {
  const [draft, setDraft] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [activeRun, setActiveRun] = useState<{ id: string; token: string } | null>(null)
  const [thinkingMessage, setThinkingMessage] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Specs tab state
  const [activeTab, setActiveTab] = useState("architect")
  const [specs, setSpecs] = useState<ProjectSpec[]>([])
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false)
  const [previewSpec, setPreviewSpec] = useState<ProjectSpec | null>(null)
  const [isSpecSubmitting, setIsSpecSubmitting] = useState(false)
  const [activeSpecRun, setActiveSpecRun] = useState<{ id: string; token: string } | null>(null)
  const [specError, setSpecError] = useState<string | null>(null)

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

  const fetchSpecs = useCallback(async () => {
    setIsLoadingSpecs(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`)
      if (!res.ok) return
      const data = (await res.json()) as ProjectSpec[]
      setSpecs(data)
    } finally {
      setIsLoadingSpecs(false)
    }
  }, [projectId])

  useEffect(() => {
    if (activeTab === "specs" && isOpen) {
      void fetchSpecs()
    }
  }, [activeTab, isOpen, fetchSpecs])

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

  const { run: specRun, error: specRunError } = useRealtimeRun<typeof generateSpecTask>(
    activeSpecRun?.id,
    { accessToken: activeSpecRun?.token ?? "", enabled: !!activeSpecRun, stopOnCompletion: true },
  )

  useEffect(() => {
    if (!specRun || !activeSpecRun) return
    const terminal =
      specRun.status === "COMPLETED" ||
      specRun.status === "FAILED" ||
      specRun.status === "CANCELED" ||
      specRun.status === "CRASHED" ||
      specRun.status === "SYSTEM_FAILURE" ||
      specRun.status === "EXPIRED" ||
      specRun.status === "TIMED_OUT" ||
      specRun.status === "PENDING_VERSION"
    if (!terminal) return
    setActiveSpecRun(null)
    if (specRun.status === "COMPLETED") {
      void fetchSpecs()
    } else {
      setSpecError("Spec generation failed. Please try again.")
    }
  }, [specRun?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!specRunError || !activeSpecRun) return
    setActiveSpecRun(null)
    setSpecError("Connection error during spec generation. Please try again.")
  }, [specRunError]) // eslint-disable-line react-hooks/exhaustive-deps

  const generateSpec = async () => {
    setSpecError(null)
    setIsSpecSubmitting(true)
    try {
      const canvas = getCanvasState?.() ?? { nodes: [], edges: [] }
      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, chatHistory: messages, nodes: canvas.nodes, edges: canvas.edges }),
      })
      const specBody = (await specRes.json()) as { runId?: string; error?: string }
      if (!specRes.ok) throw new Error(specBody.error ?? "Failed to start spec generation")

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: specBody.runId }),
      })
      const tokenBody = (await tokenRes.json()) as { token?: string; error?: string }
      if (!tokenRes.ok) throw new Error(tokenBody.error ?? "Failed to get spec token")

      setActiveSpecRun({ id: specBody.runId!, token: tokenBody.token! })
    } catch (err) {
      setSpecError(err instanceof Error ? err.message : "Spec generation failed")
    } finally {
      setIsSpecSubmitting(false)
    }
  }

  const isGeneratingSpec = isSpecSubmitting || !!activeSpecRun

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
      const designBody = (await designRes.json()) as {
        runId?: string
        publicToken?: string
        error?: string
      }

      if (designBody.runId && !designBody.publicToken) {
        setThinkingMessage(false)
        setSendError("Task started but live tracking unavailable. Canvas will update shortly.")
        return
      }
      if (!designRes.ok) throw new Error(designBody.error ?? "Design request failed")

      setActiveRun({ id: designBody.runId!, token: designBody.publicToken! })
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

  const handleDownload = (spec: ProjectSpec, e: React.MouseEvent) => {
    e.stopPropagation()
    const a = document.createElement("a")
    a.href = `/api/projects/${projectId}/specs/${spec.id}/download`
    a.download = getSpecFilename(spec.filePath)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const hasMessages = messages.length > 0 || thinkingMessage

  return (
    <>
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col overflow-hidden"
        >
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
                  className="h-8 self-end bg-accent-green px-3 text-xs text-copy-primary hover:bg-accent-green/90 disabled:opacity-40"
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
          <TabsContent value="specs" className="m-0 flex flex-1 flex-col overflow-hidden">
            <div className="shrink-0 border-b border-surface-border px-3 py-2.5">
              <Button
                onClick={() => void generateSpec()}
                disabled={isGeneratingSpec}
                className="h-8 w-full bg-ai text-xs text-white hover:bg-ai/90 disabled:opacity-50"
              >
                {isGeneratingSpec ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Spec"
                )}
              </Button>
              {specError && (
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-error">
                  <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                  {specError}
                </p>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 p-3">
                {isLoadingSpecs && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin text-copy-muted" />
                  </div>
                )}

                {!isLoadingSpecs && specs.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ai/10">
                      <FileText className="h-5 w-5 text-ai-text" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-copy-primary">No specs yet</p>
                      <p className="mt-0.5 text-xs text-copy-muted">
                        Click Generate Spec to create one
                      </p>
                    </div>
                  </div>
                )}

                {specs.map((spec) => (
                  <SpecListItem
                    key={spec.id}
                    spec={spec}
                    onClick={() => setPreviewSpec(spec)}
                    onDownload={(e) => handleDownload(spec, e)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>

      {previewSpec && (
        <SpecPreviewModal
          isOpen={!!previewSpec}
          onClose={() => setPreviewSpec(null)}
          projectId={projectId}
          specId={previewSpec.id}
          filename={getSpecFilename(previewSpec.filePath)}
        />
      )}
    </>
  )
}

function SpecListItem({
  spec,
  onClick,
  onDownload,
}: {
  spec: ProjectSpec
  onClick: () => void
  onDownload: (e: React.MouseEvent) => void
}) {
  const filename = getSpecFilename(spec.filePath)
  const date = new Date(spec.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-elevated"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ai/10">
        <FileText className="h-3.5 w-3.5 text-ai-text" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-copy-primary">{filename}</p>
        <p className="text-[10px] text-copy-muted">{date}</p>
      </div>
      <button
        onClick={onDownload}
        className="shrink-0 rounded-lg p-1.5 text-copy-faint opacity-0 transition-opacity hover:bg-subtle hover:text-copy-muted group-hover:opacity-100"
        aria-label="Download spec"
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </button>
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
            ? "bg-accent-green text-copy-primary font-medium"
            : "border border-surface-border bg-elevated text-ai-text"
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
