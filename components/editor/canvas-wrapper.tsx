"use client"

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react"
import { ErrorBoundary } from "react-error-boundary"
import { CanvasFlow } from "@/components/editor/canvas-flow"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface CanvasWrapperProps {
  roomId: string
  projectId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateImported?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
}

export function CanvasWrapper({
  roomId,
  projectId,
  pendingTemplate,
  onTemplateImported,
  onSaveStatusChange,
}: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <div className="h-full w-full">
          <ErrorBoundary fallback={<CanvasConnectionError />}>
            <ClientSideSuspense fallback={<CanvasConnecting />}>
              <CanvasFlow
                projectId={projectId}
                pendingTemplate={pendingTemplate}
                onTemplateImported={onTemplateImported}
                onSaveStatusChange={onSaveStatusChange}
              />
            </ClientSideSuspense>
          </ErrorBoundary>
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function CanvasConnecting() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-sm text-copy-muted">Connecting…</p>
    </div>
  )
}

function CanvasConnectionError() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-sm text-copy-muted">Failed to connect to canvas</p>
    </div>
  )
}
