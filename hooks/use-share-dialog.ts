"use client"

import { useCallback, useState } from "react"

export interface Collaborator {
  email: string
  displayName: string | null
  imageUrl: string | null
  addedAt: string
}

export function useShareDialog(projectId: string) {
  const [isOpen, setIsOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const fetchCollaborators = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/collaborators`)
    if (!res.ok) return
    const data = (await res.json()) as { collaborators: Collaborator[] }
    setCollaborators(data.collaborators)
  }, [projectId])

  const open = useCallback(async () => {
    setIsOpen(true)
    await fetchCollaborators()
  }, [fetchCollaborators])

  const invite = useCallback(async () => {
    const email = inviteEmail.trim()
    if (!email) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed to invite")
      setInviteEmail("")
      await fetchCollaborators()
    } finally {
      setIsLoading(false)
    }
  }, [projectId, inviteEmail, fetchCollaborators])

  const remove = useCallback(
    async (email: string) => {
      setIsLoading(true)
      try {
        await fetch(`/api/projects/${projectId}/collaborators`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        await fetchCollaborators()
      } finally {
        setIsLoading(false)
      }
    },
    [projectId, fetchCollaborators]
  )

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/editor/${projectId}`
    )
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }, [projectId])

  return {
    isOpen,
    open,
    close: () => setIsOpen(false),
    collaborators,
    inviteEmail,
    setInviteEmail,
    invite,
    remove,
    copyLink,
    isCopied,
    isLoading,
  }
}
