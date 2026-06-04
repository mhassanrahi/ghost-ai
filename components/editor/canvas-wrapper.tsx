"use client"

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react"
import { ErrorBoundary } from "react-error-boundary"
import { CanvasFlow } from "@/components/editor/canvas-flow"

interface CanvasWrapperProps {
  roomId: string
}

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <div className="h-full w-full">
          <ErrorBoundary fallback={<CanvasConnectionError />}>
            <ClientSideSuspense fallback={<CanvasConnecting />}>
              <CanvasFlow />
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
