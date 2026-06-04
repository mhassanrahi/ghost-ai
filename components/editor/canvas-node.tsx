"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { NodeProps } from "@xyflow/react"
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"
import { NODE_COLORS, DEFAULT_NODE_COLOR, NODE_SHAPES } from "@/types/canvas"

const SHAPE_MIN: Record<string, { minWidth: number; minHeight: number }> = {
  rectangle: { minWidth: 80, minHeight: 40 },
  diamond:   { minWidth: 80, minHeight: 60 },
  circle:    { minWidth: 40, minHeight: 40 },
  pill:      { minWidth: 80, minHeight: 30 },
  cylinder:  { minWidth: 50, minHeight: 50 },
  hexagon:   { minWidth: 60, minHeight: 50 },
}

const RESIZER_LINE: React.CSSProperties  = { borderColor: "#00c8d4", borderWidth: 1, opacity: 0.5 }
const RESIZER_HANDLE: React.CSSProperties = {
  backgroundColor: "#00c8d4",
  borderColor: "#00c8d4",
  width: 7,
  height: 7,
  borderRadius: 2,
  opacity: 0.75,
}

export function CanvasNodeComponent({
  data,
  selected,
  id,
  width,
  height,
}: NodeProps<CanvasNode>) {
  const shape = data.shape ?? "rectangle"
  const colorEntry = NODE_COLORS.find((c) => c.fill === data.color) ?? DEFAULT_NODE_COLOR
  const borderColor = selected ? "#00c8d4" : "#2a2a30"
  const defaults = NODE_SHAPES[shape]
  const w = width ?? defaults.width
  const h = height ?? defaults.height
  const { minWidth, minHeight } = SHAPE_MIN[shape] ?? { minWidth: 40, minHeight: 30 }

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { updateNodeData } = useReactFlow()

  useEffect(() => {
    if (editing) {
      setDraft(data.label)
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
        textareaRef.current?.select()
      })
    }
  }, [editing]) // eslint-disable-line react-hooks/exhaustive-deps

  const commitEdit = useCallback(() => {
    setEditing(false)
    updateNodeData(id, { label: draft })
  }, [id, draft, updateNodeData])

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
  }, [])

  const onTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault()
        commitEdit()
      }
      e.stopPropagation()
    },
    [commitEdit]
  )

  const handles = (
    <>
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
    </>
  )

  const resizer = (
    <NodeResizer
      isVisible={selected}
      minWidth={minWidth}
      minHeight={minHeight}
      lineStyle={RESIZER_LINE}
      handleStyle={RESIZER_HANDLE}
    />
  )

  const editingOverlay = editing ? (
    <textarea
      ref={textareaRef}
      className="nodrag nopan absolute inset-0 w-full h-full bg-transparent border-none outline-none resize-none text-center text-xs z-10"
      style={{ color: colorEntry.text, padding: "8px" }}
      value={draft}
      placeholder="Label..."
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commitEdit}
      onKeyDown={onTextareaKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  ) : null

  const labelEl = !editing ? (
    data.label ? (
      <span className="select-none px-2 text-center text-xs leading-tight pointer-events-none">
        {data.label}
      </span>
    ) : (
      <span
        className="select-none px-2 text-center text-xs leading-tight pointer-events-none"
        style={{ opacity: 0.3 }}
      >
        Label...
      </span>
    )
  ) : null

  // --- CSS shapes ---

  if (shape === "rectangle") {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center rounded-xl border text-xs overflow-hidden"
        style={{ backgroundColor: colorEntry.fill, color: colorEntry.text, borderColor }}
        onDoubleClick={onDoubleClick}
      >
        {resizer}
        {handles}
        {editingOverlay}
        {labelEl}
      </div>
    )
  }

  if (shape === "circle") {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full border text-xs overflow-hidden"
        style={{ backgroundColor: colorEntry.fill, color: colorEntry.text, borderColor }}
        onDoubleClick={onDoubleClick}
      >
        {resizer}
        {handles}
        {editingOverlay}
        {labelEl}
      </div>
    )
  }

  if (shape === "pill") {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center border text-xs overflow-hidden"
        style={{
          backgroundColor: colorEntry.fill,
          color: colorEntry.text,
          borderColor,
          borderRadius: 9999,
        }}
        onDoubleClick={onDoubleClick}
      >
        {resizer}
        {handles}
        {editingOverlay}
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
      <div
        className="relative overflow-hidden"
        style={{ width: w, height: h }}
        onDoubleClick={onDoubleClick}
      >
        {resizer}
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
          {!editing && (
            <text
              x={vw / 2}
              y={vh / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colorEntry.text}
              fillOpacity={data.label ? 1 : 0.3}
              fontSize={12}
              style={{ userSelect: "none" }}
            >
              {data.label || "Label..."}
            </text>
          )}
        </svg>
        {editingOverlay}
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
      <div
        className="relative overflow-hidden"
        style={{ width: w, height: h }}
        onDoubleClick={onDoubleClick}
      >
        {resizer}
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
          {!editing && (
            <text
              x={vw / 2}
              y={vh / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colorEntry.text}
              fillOpacity={data.label ? 1 : 0.3}
              fontSize={12}
              style={{ userSelect: "none" }}
            >
              {data.label || "Label..."}
            </text>
          )}
        </svg>
        {editingOverlay}
      </div>
    )
  }

  if (shape === "cylinder") {
    const rx = (vw - pad * 2) / 2
    const ry = Math.min(vh * 0.18, 14)
    const topY = pad + ry
    const botY = vh - pad - ry
    return (
      <div
        className="relative overflow-hidden"
        style={{ width: w, height: h }}
        onDoubleClick={onDoubleClick}
      >
        {resizer}
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
          {!editing && (
            <text
              x={vw / 2}
              y={(topY + botY) / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={colorEntry.text}
              fillOpacity={data.label ? 1 : 0.3}
              fontSize={12}
              style={{ userSelect: "none" }}
            >
              {data.label || "Label..."}
            </text>
          )}
        </svg>
        {editingOverlay}
      </div>
    )
  }

  // fallback
  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-xl border text-xs overflow-hidden"
      style={{ backgroundColor: colorEntry.fill, color: colorEntry.text, borderColor }}
      onDoubleClick={onDoubleClick}
    >
      {resizer}
      {handles}
      {editingOverlay}
      {labelEl}
    </div>
  )
}
