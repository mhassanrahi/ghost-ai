"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
} from "@xyflow/react"
import type { ReactFlowInstance } from "@xyflow/react"
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import type { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas"
import { DEFAULT_NODE_COLOR } from "@/types/canvas"
import { CanvasNodeComponent } from "@/components/editor/canvas-node"
import { CanvasEdgeComponent } from "@/components/editor/canvas-edge"
import { ShapePanel } from "@/components/editor/shape-panel"
import { CanvasControls } from "@/components/editor/canvas-controls"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = { canvasNode: CanvasNodeComponent }
const edgeTypes = { canvasEdge: CanvasEdgeComponent }
const defaultEdgeOptions = { type: "canvasEdge", data: {} }
let nodeCounter = 0

interface DragShapePayload {
  shape: NodeShape
  width: number
  height: number
}

interface CanvasFlowProps {
  pendingTemplate?: CanvasTemplate | null
  onTemplateImported?: () => void
}

export function CanvasFlow({ pendingTemplate, onTemplateImported }: CanvasFlowProps) {
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

  // Refs to read current nodes/edges inside the effect without stale closures
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  const rfInstanceRef = useRef(rfInstance)
  rfInstanceRef.current = rfInstance

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
        <Cursors />
        <ShapePanel />
        <CanvasControls
          rfInstance={rfInstance}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </ReactFlow>
    </div>
  )
}
