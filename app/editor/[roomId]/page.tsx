import { redirect } from "next/navigation"

import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access"
import { getOwnedProjects, getSharedProjects } from "@/lib/projects"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"

type Props = { params: Promise<{ roomId: string }> }

export default async function WorkspacePage({ params }: Props) {
  const { roomId } = await params

  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const project = await getProjectIfAccessible(roomId, user.userId, user.email)
  if (!project) return <AccessDenied />

  const [ownedResult, sharedResult] = await Promise.allSettled([
    getOwnedProjects(user.userId),
    getSharedProjects(user.emails),
  ])

  const ownedProjects =
    ownedResult.status === "fulfilled" ? ownedResult.value : []
  const sharedProjects =
    sharedResult.status === "fulfilled" ? sharedResult.value : []

  return (
    <WorkspaceShell
      project={project}
      isOwner={project.isOwner}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  )
}
