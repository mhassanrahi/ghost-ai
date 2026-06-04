"use client"

import type { NodeProps } from "@xyflow/react"
import { Handle, Position } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"
import { NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas"

export function CanvasNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  const colorEntry = NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR

  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-xl border text-xs"
      style={{
        backgroundColor: colorEntry.fill,
        color: colorEntry.text,
        borderColor: selected ? "#00c8d4" : "#2a2a30",
      }}
    >
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      {data.label ? (
        <span className="select-none px-2 text-center leading-tight">{data.label}</span>
      ) : null}
    </div>
  )
}
