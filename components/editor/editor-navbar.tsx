"use client"

import { UserButton } from "@clerk/nextjs"
import {
  AlertCircle,
  Check,
  LayoutTemplate,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
  onOpenShare?: () => void
  onOpenTemplates?: () => void
  saveStatus?: SaveStatus
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen,
  onToggleAiSidebar,
  onOpenShare,
  onOpenTemplates,
  saveStatus,
}: EditorNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-12 items-center border-b border-surface-border bg-surface px-3">
      <div className="flex flex-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeftOpen className="size-5" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2">
        {projectName && (
          <span className="max-w-xs truncate text-sm font-medium text-copy-primary">
            {projectName}
          </span>
        )}
        {saveStatus && saveStatus !== "idle" && (
          <div className="flex items-center gap-1 text-xs text-copy-muted">
            {saveStatus === "saving" && (
              <Loader2 className="size-3 animate-spin" />
            )}
            {saveStatus === "saved" && (
              <Check className="size-3 text-brand" />
            )}
            {saveStatus === "error" && (
              <AlertCircle className="size-3 text-state-warning" />
            )}
            <span>
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "saved"
                  ? "Saved"
                  : "Save failed"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        {onOpenTemplates && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onOpenTemplates}
          >
            <LayoutTemplate className="size-4" />
            Templates
          </Button>
        )}
        {onOpenShare && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onOpenShare}
          >
            <Share2 className="size-4" />
            Share
          </Button>
        )}
        {onToggleAiSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAiSidebar}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
          >
            {isAiSidebarOpen ? (
              <PanelRightClose className="size-5" />
            ) : (
              <PanelRightOpen className="size-5" />
            )}
          </Button>
        )}
        <UserButton />
      </div>
    </header>
  )
}
