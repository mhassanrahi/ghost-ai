"use client"

import { useState, useCallback, useRef } from "react"
import { EdgeLabelRenderer, getSmoothStepPath, useReactFlow } from "@xyflow/react"
import type { EdgeProps } from "@xyflow/react"
import type { CanvasEdge } from "@/types/canvas"

const DIM = "#808090"
const BRIGHT = "#f0f0f4"
const BG = "#18181c"
const BORDER = "#2a2a30"

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(data?.label ?? "")
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateEdgeData } = useReactFlow()

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const isActive = hovered || !!selected
  const strokeColor = isActive ? BRIGHT : DIM
  const markerDimId = `arrow-dim-${id}`
  const markerBrightId = `arrow-bright-${id}`
  const markerId = isActive ? markerBrightId : markerDimId

  const commitEdit = useCallback(() => {
    setEditing(false)
    updateEdgeData(id, { label: draft })
  }, [id, draft, updateEdgeData])

  const openEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setDraft(data?.label ?? "")
      setEditing(true)
      requestAnimationFrame(() => inputRef.current?.focus())
    },
    [data?.label]
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault()
        commitEdit()
      }
      e.stopPropagation()
    },
    [commitEdit]
  )

  const label = data?.label?.trim() ?? ""
  const hasLabel = label.length > 0

  return (
    <>
      {/* Per-edge arrow marker defs — unique IDs prevent conflicts between edges */}
      <defs>
        <marker
          id={markerDimId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={DIM} />
        </marker>
        <marker
          id={markerBrightId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={BRIGHT} />
        </marker>
      </defs>

      {/* Wide transparent hitbox — easier to hover/click without thickening the line */}
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        style={{ cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={openEdit}
      />

      {/* Visible edge */}
      <path
        d={edgePath}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: "none", transition: "stroke 0.15s ease" }}
      />

      {/* Inline label positioned at path midpoint */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onDoubleClick={openEdit}
        >
          {editing ? (
            <input
              ref={inputRef}
              className="nodrag nopan"
              style={{
                display: "block",
                background: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                color: BRIGHT,
                fontSize: 11,
                padding: "2px 8px",
                outline: "none",
                width: `${Math.max(8, draft.length + 2)}ch`,
                minWidth: "4ch",
                boxSizing: "content-box",
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={onKeyDown}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          ) : hasLabel ? (
            <span
              style={{
                display: "inline-block",
                background: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                color: BRIGHT,
                fontSize: 11,
                padding: "2px 8px",
                userSelect: "none",
                whiteSpace: "nowrap",
                cursor: "text",
              }}
            >
              {label}
            </span>
          ) : isActive ? (
            <span
              style={{
                display: "inline-block",
                color: DIM,
                fontSize: 11,
                padding: "2px 8px",
                userSelect: "none",
                cursor: "text",
                opacity: 0.7,
              }}
            >
              Add label…
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
