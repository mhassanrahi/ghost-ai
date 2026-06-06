"use client"

import { useEffect, useRef, useState } from "react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  projectId: string
  enabled: boolean
  hasUserEdited: React.RefObject<boolean>
}

export function useCanvasAutosave({
  nodes,
  edges,
  projectId,
  enabled,
  hasUserEdited,
}: UseCanvasAutosaveOptions): { saveStatus: SaveStatus } {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  // Refs so the async callback always reads the latest snapshot
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  nodesRef.current = nodes
  edgesRef.current = edges

  useEffect(() => {
    if (!enabled || !hasUserEdited.current) return

    const timer = setTimeout(async () => {
      setSaveStatus("saving")
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodes: nodesRef.current,
            edges: edgesRef.current,
          }),
        })
        setSaveStatus(response.ok ? "saved" : "error")
      } catch {
        setSaveStatus("error")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [nodes, edges, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { saveStatus }
}
