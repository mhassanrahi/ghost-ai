"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { type Project } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"

interface EditorHomeProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorHome({ ownedProjects, sharedProjects }: EditorHomeProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const {
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
  } = useProjectActions()

  return (
    <div className="flex h-screen flex-col bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-4 pt-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-semibold text-copy-primary">
            Create a project or open an existing one
          </h1>
          <p className="text-sm text-copy-muted">
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="size-4" />
          New Project
        </Button>
      </main>

      <CreateProjectDialog
        isOpen={activeDialog === "create"}
        onClose={closeDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onConfirm={handleCreate}
        isLoading={isLoading}
      />
      <RenameProjectDialog
        isOpen={activeDialog === "rename"}
        onClose={closeDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        currentName={selectedProject?.name ?? ""}
        onConfirm={handleRename}
      />
      <DeleteProjectDialog
        isOpen={activeDialog === "delete"}
        onClose={closeDialog}
        projectName={selectedProject?.name ?? ""}
        onConfirm={handleDelete}
      />
    </div>
  )
}
