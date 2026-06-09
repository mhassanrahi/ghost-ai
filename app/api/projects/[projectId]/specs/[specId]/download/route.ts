import prisma from "@/lib/prisma"
import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access"

type Context = { params: Promise<{ projectId: string; specId: string }> }

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, specId } = await params
  const project = await getProjectIfAccessible(projectId, user.userId, user.email)
  if (!project) return Response.json({ error: "Forbidden" }, { status: 403 })

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { filePath: true, projectId: true },
  })
  if (!spec) return Response.json({ error: "Not found" }, { status: 404 })
  if (spec.projectId !== projectId) return Response.json({ error: "Forbidden" }, { status: 403 })

  const blobResponse = await fetch(spec.filePath, {
    headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })
  if (!blobResponse.ok) {
    return Response.json({ error: "Failed to fetch spec" }, { status: 502 })
  }

  const content = await blobResponse.text()
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
    },
  })
}
