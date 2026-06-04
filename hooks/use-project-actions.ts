"use client"

import { useCallback, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { type Project } from "@/lib/projects"
import { toSlug } from "@/lib/slug"

type DialogType = "create" | "rename" | "delete" | null

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function useProjectActions() {
  const router = useRouter()
  const params = useParams<{ projectId?: string }>()
  const activeProjectId = params?.projectId ?? null

  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const openCreate = useCallback(() => {
    setProjectName("")
    setSelectedProject(null)
    setActiveDialog("create")
  }, [])

  const openRename = useCallback((project: Project) => {
    setProjectName(project.name)
    setSelectedProject(project)
    setActiveDialog("rename")
  }, [])

  const openDelete = useCallback((project: Project) => {
    setSelectedProject(project)
    setActiveDialog("delete")
  }, [])

  const closeDialog = useCallback(() => {
    setActiveDialog(null)
    setSelectedProject(null)
    setProjectName("")
  }, [])

  const handleCreate = useCallback(async () => {
    const name = projectName.trim()
    if (!name) return
    setIsLoading(true)
    try {
      const roomId = `${toSlug(name)}-${shortSuffix()}`
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, name }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const project: { id: string } = await res.json()
      closeDialog()
      router.push(`/editor/${encodeURIComponent(project.id)}`)
    } finally {
      setIsLoading(false)
    }
  }, [projectName, closeDialog, router])

  const handleRename = useCallback(async () => {
    if (!selectedProject || !projectName.trim()) return
    const name = projectName.trim()
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(selectedProject.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("Failed to rename project")
      closeDialog()
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }, [selectedProject, projectName, closeDialog, router])

  const handleDelete = useCallback(async () => {
    if (!selectedProject) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(selectedProject.id)}`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete project")
      closeDialog()
      if (activeProjectId === selectedProject.id) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedProject, activeProjectId, closeDialog, router])

  return {
    activeDialog,
    selectedProject,
    projectName,
    setProjectName,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
