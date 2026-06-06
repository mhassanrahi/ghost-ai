"use client"

import { Panel } from "@xyflow/react"
import type { ReactFlowInstance } from "@xyflow/react"
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

interface CanvasControlsProps {
  rfInstance: ReactFlowInstance<CanvasNode, CanvasEdge> | null
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

const ZOOM_DURATION = 300

export function CanvasControls({
  rfInstance,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <Panel position="bottom-left" className="mb-4 ml-4">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-md">
        <ControlButton
          title="Zoom out (-)"
          onClick={() => rfInstance?.zoomOut({ duration: ZOOM_DURATION })}
          disabled={!rfInstance}
        >
          <ZoomOut size={15} strokeWidth={1.5} />
        </ControlButton>
        <ControlButton
          title="Fit view"
          onClick={() => rfInstance?.fitView({ duration: ZOOM_DURATION })}
          disabled={!rfInstance}
        >
          <Maximize2 size={15} strokeWidth={1.5} />
        </ControlButton>
        <ControlButton
          title="Zoom in (+)"
          onClick={() => rfInstance?.zoomIn({ duration: ZOOM_DURATION })}
          disabled={!rfInstance}
        >
          <ZoomIn size={15} strokeWidth={1.5} />
        </ControlButton>

        <div className="mx-1 h-4 w-px bg-surface-border" />

        <ControlButton title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
          <Undo2 size={15} strokeWidth={1.5} />
        </ControlButton>
        <ControlButton
          title="Redo (Ctrl+Shift+Z)"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 size={15} strokeWidth={1.5} />
        </ControlButton>
      </div>
    </Panel>
  )
}

interface ControlButtonProps {
  title: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

function ControlButton({ title, onClick, disabled, children }: ControlButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-xl text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  )
}
