"use client"

import { useState } from "react"

import { MOCK_PROJECTS, type Project } from "@/lib/mock-projects"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"

export default function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)

  const handleCreateProject = () => {
    // TODO: Implement create project dialog
    console.log("Create project")
  }

  const handleRenameProject = (project: Project) => {
    // TODO: Implement rename project dialog
    console.log("Rename project:", project)
  }

  const handleDeleteProject = (project: Project) => {
    // TODO: Implement delete project confirmation
    console.log("Delete project:", project)
  }

  return (
    <div className="flex h-screen flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />
      <main className="flex flex-1 items-center justify-center pt-12">
        <p className="text-copy-muted text-sm">Canvas goes here</p>
      </main>
    </div>
  )
}
