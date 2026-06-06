"use client"

import { useState } from "react"

import { type Project } from "@/lib/projects"
import { useShareDialog } from "@/hooks/use-share-dialog"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"
import { CanvasWrapper } from "@/components/editor/canvas-wrapper"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface WorkspaceShellProps {
  project: { id: string; name: string }
  isOwner: boolean
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function WorkspaceShell({
  project,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null)

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
  const shareDialog = useShareDialog(project.id)

  const handleTemplateImport = (template: CanvasTemplate) => {
    setIsTemplatesOpen(false)
    setPendingTemplate(template)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        projectName={project.name}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((p) => !p)}
        onOpenShare={shareDialog.open}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
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
        <main className="relative flex-1 overflow-hidden">
          <CanvasWrapper
            roomId={project.id}
            pendingTemplate={pendingTemplate}
            onTemplateImported={() => setPendingTemplate(null)}
          />
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

      <StarterTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onImport={handleTemplateImport}
      />
      <ShareDialog
        isOpen={shareDialog.isOpen}
        onClose={shareDialog.close}
        projectId={project.id}
        isOwner={isOwner}
        collaborators={shareDialog.collaborators}
        inviteEmail={shareDialog.inviteEmail}
        onInviteEmailChange={shareDialog.setInviteEmail}
        onInvite={shareDialog.invite}
        onRemove={shareDialog.remove}
        onCopyLink={shareDialog.copyLink}
        isCopied={shareDialog.isCopied}
        isLoading={shareDialog.isLoading}
      />
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
