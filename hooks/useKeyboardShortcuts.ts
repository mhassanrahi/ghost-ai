import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

const ZOOM_DURATION = 300

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === "input" || tag === "textarea" || target.isContentEditable
}

interface UseKeyboardShortcutsOptions {
  rfInstance: ReactFlowInstance<CanvasNode, CanvasEdge> | null
  onUndo: () => void
  onRedo: () => void
}

export function useKeyboardShortcuts({
  rfInstance,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return

      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.shiftKey && e.key === "z") {
        e.preventDefault()
        onRedo()
        return
      }
      if (ctrl && (e.key === "y" || e.key === "Y")) {
        e.preventDefault()
        onRedo()
        return
      }
      if (ctrl && (e.key === "z" || e.key === "Z")) {
        e.preventDefault()
        onUndo()
        return
      }
      if (!ctrl && (e.key === "+" || e.key === "=")) {
        e.preventDefault()
        rfInstance?.zoomIn({ duration: ZOOM_DURATION })
        return
      }
      if (!ctrl && e.key === "-") {
        e.preventDefault()
        rfInstance?.zoomOut({ duration: ZOOM_DURATION })
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [rfInstance, onUndo, onRedo])
}
