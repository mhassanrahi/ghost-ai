"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Download, Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface SpecPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  specId: string
  filename: string
}

export function SpecPreviewModal({
  isOpen,
  onClose,
  projectId,
  specId,
  filename,
}: SpecPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !specId) return
    const controller = new AbortController()
    setContent(null)
    setError(null)
    setIsLoading(true)

    fetch(`/api/projects/${projectId}/specs/${specId}/download`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load spec (${res.status})`)
        return res.text()
      })
      .then((text) => {
        if (!controller.signal.aborted) setContent(text)
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [isOpen, specId, projectId])

  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = `/api/projects/${projectId}/specs/${specId}/download`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl border-surface-border bg-surface p-0">
        <DialogHeader className="shrink-0 border-b border-surface-border px-6 py-4">
          <DialogTitle className="truncate text-sm font-semibold text-copy-primary">
            {filename}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 py-12 text-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {content && (
            <div className="prose prose-invert prose-sm max-w-none text-copy-secondary [&_code]:rounded [&_code]:bg-elevated [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-copy-primary [&_h1]:text-copy-primary [&_h2]:text-copy-primary [&_h3]:text-copy-primary [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-surface-border [&_pre]:bg-elevated [&_pre]:p-4 [&_strong]:text-copy-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </ScrollArea>

        <div className="shrink-0 border-t border-surface-border px-6 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-8 border-surface-border text-xs text-copy-muted hover:text-copy-primary"
          >
            <Download className="mr-1.5 h-3 w-3" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
