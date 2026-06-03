"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 top-12 z-10 flex w-72 flex-col",
        "border-r border-surface-border bg-surface/95 backdrop-blur-md",
        "transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <span className="text-sm font-semibold text-copy-primary">Projects</span>
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
            className="flex flex-1 items-center justify-center px-4"
          >
            <p className="text-center text-sm text-copy-muted">No projects yet</p>
          </TabsContent>
          <TabsContent
            value="shared"
            className="flex flex-1 items-center justify-center px-4"
          >
            <p className="text-center text-sm text-copy-muted">No shared projects</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="shrink-0 border-t border-surface-border p-3">
        <Button variant="outline" className="w-full gap-2">
          <Plus className="size-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
