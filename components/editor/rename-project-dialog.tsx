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

interface RenameProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onProjectNameChange: (name: string) => void
  currentName: string
  onConfirm: () => void
}

export function RenameProjectDialog({
  isOpen,
  onClose,
  projectName,
  onProjectNameChange,
  currentName,
  onConfirm,
}: RenameProjectDialogProps) {
  const slug = toSlug(projectName)
  const trimmed = projectName.trim()
  const slugIsEmpty = !!trimmed && !slug
  const hasStrippedChars = !!trimmed && !!slug && /[^a-z0-9\s-]/i.test(trimmed)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="rounded-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-copy-primary">Rename Project</DialogTitle>
          <DialogDescription>
            Renaming &quot;{currentName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            className="text-copy-primary"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !slugIsEmpty) onConfirm() }}
            autoFocus
          />
          {trimmed && (
            <p className="text-xs text-copy-muted">
              Slug:{" "}
              <span className="font-mono text-copy-secondary">{slug || "—"}</span>
            </p>
          )}
          {slugIsEmpty && (
            <p className="text-xs text-error">
              Name must contain at least one letter or number.
            </p>
          )}
          {hasStrippedChars && (
            <p className="text-xs text-warning">
              Special characters will be removed from the slug.
            </p>
          )}
        </div>
        <DialogFooter showCloseButton>
          <Button onClick={onConfirm} disabled={!trimmed || slugIsEmpty}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
