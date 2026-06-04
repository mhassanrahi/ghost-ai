"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"

import { type Project } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectItemProps {
  project: Project
  isActive: boolean
  onRename: () => void
  onDelete: () => void
}

function ProjectItem({ project, isActive, onRename, onDelete }: ProjectItemProps) {
  return (
    <div className={cn(
      "group relative flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 hover:bg-elevated",
      isActive && "bg-elevated"
    )}>
      <span className="flex-1 truncate text-sm text-copy-primary">
        {project.name}
      </span>
      {project.isOwned && (
        <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onRename()
            }}
            aria-label="Rename project"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label="Delete project"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: Project[]
  sharedProjects: Project[]
  activeRoomId?: string
  onCreateProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  activeRoomId,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9] bg-black/50 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-12 z-10 flex w-72 flex-col",
          "border-r border-surface-border bg-surface/95 backdrop-blur-md",
          "transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <span className="text-sm font-semibold text-copy-primary">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <Tabs defaultValue="my-projects" className="flex flex-1 flex-col">
            <div className="px-3 pt-3">
              <TabsList className="w-full">
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="my-projects"
              className="flex-1 overflow-y-auto px-3 py-2"
            >
              {ownedProjects.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-sm text-copy-muted">
                    No projects yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeRoomId}
                      onRename={() => onRenameProject(project)}
                      onDelete={() => onDeleteProject(project)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="shared"
              className="flex-1 overflow-y-auto px-3 py-2"
            >
              {sharedProjects.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-sm text-copy-muted">
                    No shared projects
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeRoomId}
                      onRename={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="shrink-0 border-t border-surface-border p-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onCreateProject}
          >
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
