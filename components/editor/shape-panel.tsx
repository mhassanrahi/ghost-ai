"use client"

import { Panel } from "@xyflow/react"
import {
  RectangleHorizontal,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from "lucide-react"
import type { NodeShape } from "@/types/canvas"
import { NODE_SHAPES } from "@/types/canvas"

interface ShapeConfig {
  shape: NodeShape
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
}

const SHAPE_CONFIGS: ShapeConfig[] = [
  { shape: "rectangle", icon: RectangleHorizontal },
  { shape: "diamond", icon: Diamond },
  { shape: "circle", icon: Circle },
  { shape: "pill", icon: Pill },
  { shape: "cylinder", icon: Cylinder },
  { shape: "hexagon", icon: Hexagon },
]

export function ShapePanel() {
  function onDragStart(e: React.DragEvent, shape: NodeShape) {
    const payload = { shape, ...NODE_SHAPES[shape] }
    e.dataTransfer.setData("application/ghost-ai-shape", JSON.stringify(payload))
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <Panel position="bottom-center" className="mb-4">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 px-3 py-2 shadow-lg backdrop-blur-md">
        {SHAPE_CONFIGS.map(({ shape, icon: Icon }) => (
          <button
            key={shape}
            type="button"
            draggable
            onDragStart={(e) => onDragStart(e, shape)}
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-xl text-copy-muted transition-colors hover:bg-elevated hover:text-copy-primary active:cursor-grabbing"
            title={shape}
          >
            <Icon size={16} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </Panel>
  )
}
