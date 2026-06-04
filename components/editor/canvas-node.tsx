"use client"

import type { NodeProps } from "@xyflow/react"
import { Handle, Position } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"
import { NODE_COLORS, DEFAULT_NODE_COLOR, NODE_SHAPES } from "@/types/canvas"

export function CanvasNodeComponent({
  data,
  selected,
  width,
  height,
}: NodeProps<CanvasNode>) {
  const shape = data.shape ?? "rectangle"
  const colorEntry = NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR
  const borderColor = selected ? "#00c8d4" : "#2a2a30"
  const defaults = NODE_SHAPES[shape]
  const w = width ?? defaults.width
  const h = height ?? defaults.height

  const handles = (
    <>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
    </>
  )

  const labelEl = data.label ? (
    <span className="select-none px-2 text-center text-xs leading-tight">
      {data.label}
    </span>
  ) : null

  // --- CSS shapes ---

  if (shape === "rectangle") {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center rounded-xl border text-xs"
        style={{ backgroundColor: colorEntry.fill, color: colorEntry.text, borderColor }}
      >
        {handles}
        {labelEl}
      </div>
    )
  }

  if (shape === "circle") {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full border text-xs"
        style={{ backgroundColor: colorEntry.fill, color: colorEntry.text, borderColor }}
      >
        {handles}
        {labelEl}
      </div>
    )
  }

  if (shape === "pill") {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center border text-xs"
        style={{
          backgroundColor: colorEntry.fill,
          color: colorEntry.text,
          borderColor,
          borderRadius: 9999,
        }}
      >
        {handles}
        {labelEl}
      </div>
    )
  }

  // --- SVG shapes ---

  const vw = defaults.width
  const vh = defaults.height
  const pad = 2

  if (shape === "diamond") {
    const pts = `${vw / 2},${pad} ${vw - pad},${vh / 2} ${vw / 2},${vh - pad} ${pad},${vh / 2}`
    return (
      <div className="relative" style={{ width: w, height: h }}>
        {handles}
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${vw} ${vh}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={pts}
            fill={colorEntry.fill}
            stroke={borderColor}
            strokeWidth={2}
          />
          {data.label && (
            <text
              x={vw / 2}
              y={vh / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colorEntry.text}
              fontSize={12}
              style={{ userSelect: "none" }}
            >
              {data.label}
            </text>
          )}
        </svg>
      </div>
    )
  }

  if (shape === "hexagon") {
    // Flat-side hexagon: six points
    const pts = [
      `${vw / 4 + pad},${pad}`,
      `${(3 * vw) / 4 - pad},${pad}`,
      `${vw - pad},${vh / 2}`,
      `${(3 * vw) / 4 - pad},${vh - pad}`,
      `${vw / 4 + pad},${vh - pad}`,
      `${pad},${vh / 2}`,
    ].join(" ")
    return (
      <div className="relative" style={{ width: w, height: h }}>
        {handles}
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${vw} ${vh}`}
          preserveAspectRatio="none"
        >
          <polygon
            points={pts}
            fill={colorEntry.fill}
            stroke={borderColor}
            strokeWidth={2}
          />
          {data.label && (
            <text
              x={vw / 2}
              y={vh / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colorEntry.text}
              fontSize={12}
              style={{ userSelect: "none" }}
            >
              {data.label}
            </text>
          )}
        </svg>
      </div>
    )
  }

  if (shape === "cylinder") {
    const rx = (vw - pad * 2) / 2
    const ry = Math.min(vh * 0.18, 14)
    const topY = pad + ry
    const botY = vh - pad - ry
    return (
      <div className="relative" style={{ width: w, height: h }}>
        {handles}
        <svg
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${vw} ${vh}`}
          preserveAspectRatio="none"
        >
          {/* bottom cap */}
          <ellipse
            cx={vw / 2}
            cy={botY}
            rx={rx}
            ry={ry}
            fill={colorEntry.fill}
            stroke={borderColor}
            strokeWidth={2}
          />
          {/* body fill (covers upper half of bottom cap) */}
          <rect
            x={pad}
            y={topY}
            width={vw - pad * 2}
            height={botY - topY}
            fill={colorEntry.fill}
            stroke="none"
          />
          {/* body side borders */}
          <line
            x1={pad}
            y1={topY}
            x2={pad}
            y2={botY}
            stroke={borderColor}
            strokeWidth={2}
          />
          <line
            x1={vw - pad}
            y1={topY}
            x2={vw - pad}
            y2={botY}
            stroke={borderColor}
            strokeWidth={2}
          />
          {/* top cap */}
          <ellipse
            cx={vw / 2}
            cy={topY}
            rx={rx}
            ry={ry}
            fill={colorEntry.fill}
            stroke={borderColor}
            strokeWidth={2}
          />
          {data.label && (
            <text
              x={vw / 2}
              y={(topY + botY) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colorEntry.text}
              fontSize={12}
              style={{ userSelect: "none" }}
            >
              {data.label}
            </text>
          )}
        </svg>
      </div>
    )
  }

  // fallback
  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-xl border text-xs"
      style={{ backgroundColor: colorEntry.fill, color: colorEntry.text, borderColor }}
    >
      {handles}
      {labelEl}
    </div>
  )
}
