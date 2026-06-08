"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
} from "@xyflow/react"
import type { ReactFlowInstance, NodeChange, EdgeChange } from "@xyflow/react"
import { useUndo, useRedo, useCanUndo, useCanRedo, useOther, useEventListener } from "@liveblocks/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import type { CursorsCursorProps } from "@liveblocks/react-flow"
import { PresenceAvatars } from "@/components/editor/presence-avatars"
import type { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas"
import { DEFAULT_NODE_COLOR } from "@/types/canvas"
import { CanvasNodeComponent } from "@/components/editor/canvas-node"
import { CanvasEdgeComponent } from "@/components/editor/canvas-edge"
import { ShapePanel } from "@/components/editor/shape-panel"
import { CanvasControls } from "@/components/editor/canvas-controls"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = { canvasNode: CanvasNodeComponent }
const edgeTypes = { canvasEdge: CanvasEdgeComponent }
const defaultEdgeOptions = { type: "canvasEdge", data: {} }
let nodeCounter = 0

function LiveCursor({ connectionId }: CursorsCursorProps) {
  const info = useOther(connectionId, (o) => o.info)
  if (!info) return null

  return (
    <div className="pointer-events-none select-none">
      <svg
        width="14"
        height="18"
        viewBox="0 0 14 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1 L1 14 L4.5 10.5 L7 16.5 L9 15.5 L6.5 9.5 L12 9.5 Z"
          fill={info.color}
          stroke="white"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="mt-0.5 max-w-[120px] truncate rounded-full px-2 py-0.5 text-[11px] font-medium leading-tight text-white"
        style={{ backgroundColor: info.color }}
      >
        {info.name}
      </div>
    </div>
  )
}

const cursorComponents = { Cursor: LiveCursor }

interface DragShapePayload {
  shape: NodeShape
  width: number
  height: number
}

interface CanvasFlowProps {
  projectId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateImported?: () => void
  onSaveStatusChange?: (status: SaveStatus) => void
}

interface CanvasData {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

export function CanvasFlow({
  projectId,
  pendingTemplate,
  onTemplateImported,
  onSaveStatusChange,
}: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts({ rfInstance, onUndo: undo, onRedo: redo })

  useEventListener(({ event }) => {
    const e = event as { type: string; status: string; message: string }
    if (e.type !== "AI_STATUS") return
    setAiStatus({ message: e.message, variant: e.status === "error" ? "error" : "info" })
    if (e.status === "complete" || e.status === "error") {
      setTimeout(() => setAiStatus(null), 3000)
    }
  })

  // Tracks whether the user has made any edits after mount — gates autosave
  const hasUserEdited = useRef(false)
  // Becomes true once the initial room-empty check + optional blob load finishes
  const [saveEnabled, setSaveEnabled] = useState(false)
  const [aiStatus, setAiStatus] = useState<{ message: string; variant: "info" | "error" } | null>(null)

  // Refs to read current values inside effects without stale closures
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const rfInstanceRef = useRef(rfInstance)
  rfInstanceRef.current = rfInstance

  // Wrap user-facing handlers so we know when the user makes edits
  const handleNodesChange = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      hasUserEdited.current = true
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<CanvasEdge>[]) => {
      hasUserEdited.current = true
      onEdgesChange(changes)
    },
    [onEdgesChange],
  )

  // On mount: if room is empty try loading saved canvas from blob
  useEffect(() => {
    const currentNodes = nodesRef.current
    const currentEdges = edgesRef.current

    if (currentNodes.length > 0 || currentEdges.length > 0) {
      setSaveEnabled(true)
      return
    }

    fetch(`/api/projects/${projectId}/canvas`)
      .then(async (res) => {
        if (!res.ok) return
        const data = (await res.json()) as CanvasData | null
        if (!data) return
        if (data.nodes.length > 0) {
          onNodesChange(data.nodes.map((n) => ({ type: "add" as const, item: n })))
        }
        if (data.edges.length > 0) {
          onEdgesChange(data.edges.map((e) => ({ type: "add" as const, item: e })))
        }
        requestAnimationFrame(() => rfInstanceRef.current?.fitView({ duration: 300 }))
      })
      .catch(() => {
        // Non-fatal — canvas starts empty
      })
      .finally(() => {
        setSaveEnabled(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { saveStatus } = useCanvasAutosave({
    nodes,
    edges,
    projectId,
    enabled: saveEnabled,
    hasUserEdited,
  })

  useEffect(() => {
    onSaveStatusChange?.(saveStatus)
  }, [saveStatus, onSaveStatusChange])

  // Template import — uses raw handlers (bypasses user-edit tracking; set flag explicitly)
  useEffect(() => {
    if (!pendingTemplate) return
    const currentNodes = nodesRef.current
    const currentEdges = edgesRef.current

    if (currentNodes.length > 0) {
      onNodesChange(currentNodes.map((n) => ({ type: "remove" as const, id: n.id })))
    }
    if (currentEdges.length > 0) {
      onEdgesChange(currentEdges.map((e) => ({ type: "remove" as const, id: e.id })))
    }
    if (pendingTemplate.nodes.length > 0) {
      onNodesChange(
        pendingTemplate.nodes.map((n) => ({ type: "add" as const, item: n })),
      )
    }
    if (pendingTemplate.edges.length > 0) {
      onEdgesChange(
        pendingTemplate.edges.map((e) => ({ type: "add" as const, item: e })),
      )
    }

    hasUserEdited.current = true
    onTemplateImported?.()
    requestAnimationFrame(() => rfInstanceRef.current?.fitView({ duration: 300 }))
  }, [pendingTemplate]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!rfInstance) return
      const raw = e.dataTransfer.getData("application/ghost-ai-shape")
      if (!raw) return
      const payload = JSON.parse(raw) as DragShapePayload
      const position = rfInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })
      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounter++}`,
        type: "canvasNode",
        position: {
          x: position.x - payload.width / 2,
          y: position.y - payload.height / 2,
        },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.fill,
          shape: payload.shape,
        },
        width: payload.width,
        height: payload.height,
      }
      onNodesChange([{ type: "add", item: newNode }])
    },
    [rfInstance, onNodesChange],
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Cursors components={cursorComponents} />
        <PresenceAvatars />
        <ShapePanel />
        <CanvasControls
          rfInstance={rfInstance}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        {aiStatus && (
          <Panel position="top-center">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-xs shadow-lg backdrop-blur-sm",
                "border bg-elevated/95",
                aiStatus.variant === "error"
                  ? "border-state-error/30 text-state-error"
                  : "border-surface-border text-copy-primary"
              )}
            >
              <Bot className="h-3 w-3 text-ai-text" />
              {aiStatus.message}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
