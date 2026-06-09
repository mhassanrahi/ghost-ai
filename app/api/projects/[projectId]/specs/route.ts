import prisma from "@/lib/prisma"
import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access"

type Context = { params: Promise<{ projectId: string }> }

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const project = await getProjectIfAccessible(projectId, user.userId, user.email)
  if (!project) return Response.json({ error: "Forbidden" }, { status: 403 })

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filePath: true, createdAt: true },
  })

  return Response.json(specs)
}
