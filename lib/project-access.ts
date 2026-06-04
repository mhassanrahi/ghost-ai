import { auth, currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function getCurrentUser(): Promise<{ userId: string; email: string; emails: string[] } | null> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ""
  const emails = user?.emailAddresses?.map((e) => e.emailAddress) ?? []
  return { userId, email, emails }
}

export async function getProjectIfAccessible(
  projectId: string,
  userId: string,
  email: string
): Promise<{ id: string; name: string; isOwner: boolean } | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, ownerId: true },
  })
  if (!project) return null

  if (project.ownerId === userId) {
    return { id: project.id, name: project.name, isOwner: true }
  }

  if (email) {
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
      select: { id: true },
    })
    if (collab) return { id: project.id, name: project.name, isOwner: false }
  }

  return null
}
