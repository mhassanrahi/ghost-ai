import type { Node, Edge } from "@xyflow/react"

// @xyflow/react requires node/edge data types to extend Record<string, unknown>
export interface NodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: "rectangle" | "circle" | "diamond"
}

export interface EdgeData extends Record<string, unknown> {}

export type CanvasNode = Node<NodeData, "canvasNode">
export type CanvasEdge = Edge<EdgeData, "canvasEdge">
