"use client"

import { UserButton } from "@clerk/nextjs"
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  projectName?: string
  isAiSidebarOpen?: boolean
  onToggleAiSidebar?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen,
  onToggleAiSidebar,
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

      <div className="flex flex-1 items-center justify-center">
        {projectName && (
          <span className="max-w-xs truncate text-sm font-medium text-copy-primary">
            {projectName}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end gap-1">
        {onToggleAiSidebar && (
          <>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" disabled>
              <Share2 className="size-4" />
              Share
            </Button>
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
          </>
        )}
        <UserButton />
      </div>
    </header>
  )
}
