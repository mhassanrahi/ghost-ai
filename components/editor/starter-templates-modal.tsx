"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine } from "lucide-react"
import { NODE_COLORS, NODE_SHAPES } from "@/types/canvas"
import type { NodeShape } from "@/types/canvas"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { CANVAS_TEMPLATES } from "@/components/editor/starter-templates"

interface StarterTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl rounded-3xl border-surface-border bg-surface p-0">
        <DialogHeader className="border-b border-surface-border px-6 py-5">
          <DialogTitle className="text-base font-semibold text-copy-primary">
            Import Template
          </DialogTitle>
          <p className="mt-1 text-sm text-copy-muted">
            Choose a starter template to pre-populate your canvas. Any existing nodes will
            be replaced — use{" "}
            <kbd className="rounded border border-surface-border bg-elevated px-1.5 py-0.5 font-mono text-xs text-copy-secondary">
              ⌘Z
            </kbd>{" "}
            to undo.
          </p>
        </DialogHeader>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {CANVAS_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={() => onImport(template)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({
  template,
  onImport,
}: {
  template: CanvasTemplate
  onImport: () => void
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-elevated">
      {/* Preview area — clipped so SVG cannot bleed outside */}
      <div className="relative h-48 w-full overflow-hidden bg-base">
        <TemplatePreview nodes={template.nodes} edges={template.edges} />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-copy-primary">{template.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-copy-muted">
            {template.description}
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={onImport} className="w-full gap-1.5">
          <ArrowDownToLine className="size-3.5" />
          Import
        </Button>
      </div>
    </div>
  )
}

// Internal coordinate space for the preview; the SVG scales to fill its container via viewBox.
const VB_W = 300
const VB_H = 190

function TemplatePreview({
  nodes,
  edges,
}: {
  nodes: CanvasTemplate["nodes"]
  edges: CanvasTemplate["edges"]
}) {
  if (nodes.length === 0) {
    return <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VB_W} ${VB_H}`} />
  }

  const coords = nodes.map((node) => {
    const shape = (node.data.shape as NodeShape) ?? "rectangle"
    const dims = NODE_SHAPES[shape]
    return {
      x: node.position.x,
      y: node.position.y,
      w: (node.width as number) || dims.width,
      h: (node.height as number) || dims.height,
    }
  })

  const minX = Math.min(...coords.map((c) => c.x))
  const minY = Math.min(...coords.map((c) => c.y))
  const maxX = Math.max(...coords.map((c) => c.x + c.w))
  const maxY = Math.max(...coords.map((c) => c.y + c.h))

  const boundsW = maxX - minX || 1
  const boundsH = maxY - minY || 1
  const scale = Math.min((VB_W - 24) / boundsW, (VB_H - 24) / boundsH) * 0.9

  const ox = (VB_W - boundsW * scale) / 2
  const oy = (VB_H - boundsH * scale) / 2

  const tx = (x: number) => (x - minX) * scale + ox
  const ty = (y: number) => (y - minY) * scale + oy

  const centers = new Map(
    nodes.map((node, i) => [
      node.id,
      {
        cx: tx(node.position.x + coords[i].w / 2),
        cy: ty(node.position.y + coords[i].h / 2),
      },
    ]),
  )

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {edges.map((edge) => {
        const src = centers.get(edge.source)
        const tgt = centers.get(edge.target)
        if (!src || !tgt) return null
        return (
          <line
            key={edge.id}
            x1={src.cx}
            y1={src.cy}
            x2={tgt.cx}
            y2={tgt.cy}
            stroke="#3a3a42"
            strokeWidth={1.5}
          />
        )
      })}
      {nodes.map((node, i) => {
        const c = coords[i]
        const x = tx(node.position.x)
        const y = ty(node.position.y)
        const w = c.w * scale
        const h = c.h * scale
        const fill = (node.data.color as string) || NODE_COLORS[0].fill
        const shape = (node.data.shape as NodeShape) ?? "rectangle"
        return (
          <PreviewShape key={node.id} x={x} y={y} w={w} h={h} fill={fill} shape={shape} />
        )
      })}
    </svg>
  )
}

function PreviewShape({
  x,
  y,
  w,
  h,
  fill,
  shape,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  shape: NodeShape
}) {
  switch (shape) {
    case "circle":
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={fill} />
    case "pill":
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} ry={h / 2} fill={fill} />
    case "diamond": {
      const cx = x + w / 2
      const cy = y + h / 2
      return (
        <polygon
          points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`}
          fill={fill}
        />
      )
    }
    case "hexagon": {
      const cx = x + w / 2
      const cy = y + h / 2
      const r = Math.min(w, h) / 2
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
      }).join(" ")
      return <polygon points={pts} fill={fill} />
    }
    case "cylinder":
      return <rect x={x} y={y} width={w} height={h} rx={3} ry={3} fill={fill} />
    default:
      return <rect x={x} y={y} width={w} height={h} rx={2} ry={2} fill={fill} />
  }
}
