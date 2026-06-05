"use client"

import { useCallback, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
} from "@xyflow/react"
import type { ReactFlowInstance } from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import type { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas"
import { DEFAULT_NODE_COLOR } from "@/types/canvas"
import { CanvasNodeComponent } from "@/components/editor/canvas-node"
import { CanvasEdgeComponent } from "@/components/editor/canvas-edge"
import { ShapePanel } from "@/components/editor/shape-panel"
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

export function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)

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
    [rfInstance, onNodesChange]
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
        <MiniMap />
        <Cursors />
        <ShapePanel />
      </ReactFlow>
    </div>
  )
}
