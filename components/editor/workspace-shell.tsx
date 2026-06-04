"use client"

import { useState } from "react"

import { type Project } from "@/lib/projects"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"

interface WorkspaceShellProps {
  project: { id: string; name: string }
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
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
    <div className="flex h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        projectName={project.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((p) => !p)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeRoomId={project.id}
        onCreateProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
      />

      <div className="flex flex-1 overflow-hidden pt-12">
        <main className="flex flex-1 items-center justify-center bg-base">
          <p className="text-sm text-copy-muted">Canvas coming soon</p>
        </main>

        {isAiSidebarOpen && (
          <aside className="flex w-80 shrink-0 flex-col border-l border-surface-border bg-surface">
            <div className="flex h-12 shrink-0 items-center border-b border-surface-border px-4">
              <span className="text-sm font-semibold text-copy-primary">
                AI Assistant
              </span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-copy-muted">Coming soon</p>
            </div>
          </aside>
        )}
      </div>

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
