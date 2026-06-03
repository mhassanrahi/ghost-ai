"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toSlug } from "@/lib/slug"

interface CreateProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onProjectNameChange: (name: string) => void
  onConfirm: () => void
  isLoading: boolean
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  projectName,
  onProjectNameChange,
  onConfirm,
  isLoading,
}: CreateProjectDialogProps) {
  const slug = toSlug(projectName)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="rounded-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-copy-primary">Create Project</DialogTitle>
          <DialogDescription>
            Give your architecture workspace a name.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            className="text-copy-primary"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
          />
          {projectName && (
            <p className="text-xs text-copy-muted">
              Slug:{" "}
              <span className="font-mono text-copy-secondary">{slug}</span>
            </p>
          )}
        </div>
        <DialogFooter showCloseButton>
          <Button
            onClick={onConfirm}
            disabled={!projectName.trim() || isLoading}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
