import prisma from "@/lib/prisma"

export interface Project {
  id: string
  name: string
  isOwned: boolean
}

export async function getOwnedProjects(userId: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  })
  return rows.map((p) => ({ ...p, isOwned: true }))
}

export async function getSharedProjects(email: string): Promise<Project[]> {
  if (!email) return []

  const collabs = await prisma.projectCollaborator.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, name: true } } },
  })
  return collabs.map((c) => ({ id: c.project.id, name: c.project.name, isOwned: false }))
}
