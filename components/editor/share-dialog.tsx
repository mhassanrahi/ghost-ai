"use client"

import { Check, Copy, Link, X } from "lucide-react"

import { type Collaborator } from "@/hooks/use-share-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  isOwner: boolean
  collaborators: Collaborator[]
  inviteEmail: string
  onInviteEmailChange: (email: string) => void
  onInvite: () => void
  onRemove: (email: string) => void
  onCopyLink: () => void
  isCopied: boolean
  isLoading: boolean
}

function Avatar({
  displayName,
  imageUrl,
  email,
}: {
  displayName: string | null
  imageUrl: string | null
  email: string
}) {
  const initial = (displayName ?? email).charAt(0).toUpperCase()
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated text-xs font-medium text-copy-secondary">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={displayName ?? email} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </div>
  )
}

export function ShareDialog({
  isOpen,
  onClose,
  projectId,
  isOwner,
  collaborators,
  inviteEmail,
  onInviteEmailChange,
  onInvite,
  onRemove,
  onCopyLink,
  isCopied,
  isLoading,
}: ShareDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">Share</DialogTitle>
        </DialogHeader>

        {/* Copy link */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-surface-border bg-elevated px-3 py-2">
            <Link className="size-3.5 shrink-0 text-copy-muted" />
            <span className="flex-1 truncate font-mono text-xs text-copy-muted">
              /editor/{projectId}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onCopyLink} aria-label="Copy link">
            {isCopied ? (
              <Check className="size-4 text-success" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>

        {/* Invite section (owner only) */}
        {isOwner && (
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => onInviteEmailChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onInvite()
                }
              }}
              className="flex-1 text-copy-primary"
            />
            <Button
              onClick={onInvite}
              disabled={!inviteEmail.trim() || isLoading}
              size="sm"
            >
              Invite
            </Button>
          </div>
        )}

        {/* Collaborator list */}
        {collaborators.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-copy-muted">
              People with access
            </p>
            <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
              {collaborators.map((c) => (
                <div key={c.email} className="flex items-center gap-3 py-0.5">
                  <Avatar
                    displayName={c.displayName}
                    imageUrl={c.imageUrl}
                    email={c.email}
                  />
                  <div className="min-w-0 flex-1">
                    {c.displayName && (
                      <p className="truncate text-sm text-copy-primary">
                        {c.displayName}
                      </p>
                    )}
                    <p className="truncate text-xs text-copy-muted">{c.email}</p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemove(c.email)}
                      disabled={isLoading}
                      aria-label={`Remove ${c.email}`}
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {collaborators.length === 0 && !isOwner && (
          <p className="py-2 text-center text-sm text-copy-muted">
            No collaborators yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
