import { put } from "@vercel/blob"

import prisma from "@/lib/prisma"
import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access"

type Context = { params: Promise<{ projectId: string }> }

export async function GET(_request: Request, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const project = await getProjectIfAccessible(projectId, user.userId, user.email)
  if (!project) return Response.json({ error: "Forbidden" }, { status: 403 })

  const record = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  })
  if (!record?.canvasJsonPath) {
    return Response.json(null, { status: 404 })
  }

  const blobResponse = await fetch(record.canvasJsonPath)
  if (!blobResponse.ok) {
    return Response.json({ error: "Failed to fetch canvas snapshot" }, { status: 502 })
  }

  const data: unknown = await blobResponse.json()
  return Response.json(data)
}

export async function PUT(request: Request, { params }: Context) {
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params
  const project = await getProjectIfAccessible(projectId, user.userId, user.email)
  if (!project) return Response.json({ error: "Forbidden" }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !Array.isArray((body as Record<string, unknown>).nodes) ||
    !Array.isArray((body as Record<string, unknown>).edges)
  ) {
    return Response.json({ error: "Invalid canvas data" }, { status: 400 })
  }

  const blob = await put(
    `canvas/${projectId}/canvas.json`,
    JSON.stringify(body),
    { access: "public", contentType: "application/json", allowOverwrite: true },
  )

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  })

  return Response.json({ url: blob.url })
}
