import type { Node, Edge } from "@xyflow/react"

export type NodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon"

// @xyflow/react requires node/edge data types to extend Record<string, unknown>
export interface NodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: NodeShape
}

export interface EdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasNode = Node<NodeData, "canvasNode">
export type CanvasEdge = Edge<EdgeData, "canvasEdge">

export const NODE_SHAPES: Record<NodeShape, { width: number; height: number }> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 160, height: 120 },
  circle: { width: 80, height: 80 },
  pill: { width: 160, height: 60 },
  cylinder: { width: 100, height: 80 },
  hexagon: { width: 120, height: 100 },
}

export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const

export const DEFAULT_NODE_COLOR = NODE_COLORS[0]
