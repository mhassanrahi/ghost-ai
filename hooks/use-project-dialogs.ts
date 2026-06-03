"use client"

import { useCallback, useState } from "react"

import { type Project, MOCK_PROJECTS } from "@/lib/mock-projects"
import { toSlug } from "@/lib/slug"

type DialogType = "create" | "rename" | "delete" | null

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
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

  const handleCreate = useCallback(() => {
    const name = projectName.trim()
    if (!name) return
    setIsLoading(true)
    // placeholder — synchronous with mock data; becomes meaningful when replaced with an API call
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      slug: toSlug(name),
      isOwned: true,
    }
    setProjects((prev) => [...prev, newProject])
    setIsLoading(false)
    closeDialog()
  }, [projectName, closeDialog])

  const handleRename = useCallback(() => {
    if (!selectedProject || !projectName.trim()) return
    const name = projectName.trim()
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id ? { ...p, name, slug: toSlug(name) } : p
      )
    )
    closeDialog()
  }, [selectedProject, projectName, closeDialog])

  const handleDelete = useCallback(() => {
    if (!selectedProject) return
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
    closeDialog()
  }, [selectedProject, closeDialog])

  return {
    projects,
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
