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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="rounded-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Renaming &quot;{currentName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Project name"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onConfirm() }}
          autoFocus
        />
        <DialogFooter showCloseButton>
          <Button onClick={onConfirm} disabled={!projectName.trim()}>
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
