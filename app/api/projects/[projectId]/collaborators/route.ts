import { auth, currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { enrichEmailsWithClerk } from "@/lib/clerk-users"

type Context = { params: Promise<{ projectId: string }> }

export async function GET(_request: Request, { params }: Context) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })

  const isOwner = project.ownerId === userId
  if (!isOwner) {
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress
    if (!email) return Response.json({ error: "Forbidden" }, { status: 403 })
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
      select: { id: true },
    })
    if (!collab) return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true, createdAt: true },
  })

  const enriched = await enrichEmailsWithClerk(rows.map((r) => r.email))

  const collaborators = rows.map((row, i) => ({
    email: row.email,
    displayName: enriched[i]?.displayName ?? null,
    imageUrl: enriched[i]?.imageUrl ?? null,
    addedAt: row.createdAt.toISOString(),
  }))

  return Response.json({ collaborators })
}

export async function POST(request: Request, { params }: Context) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    // ignore parse errors
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email" }, { status: 400 })
  }

  const collab = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    create: { projectId, email },
    update: {},
    select: { email: true, createdAt: true },
  })

  const [enriched] = await enrichEmailsWithClerk([collab.email])
  return Response.json(
    {
      email: collab.email,
      displayName: enriched?.displayName ?? null,
      imageUrl: enriched?.imageUrl ?? null,
      addedAt: collab.createdAt.toISOString(),
    },
    { status: 201 }
  )
}

export async function DELETE(request: Request, { params }: Context) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return Response.json({ error: "Not found" }, { status: 404 })
  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    // ignore parse errors
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!email) {
    return Response.json({ error: "email is required" }, { status: 400 })
  }

  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email },
  })

  return new Response(null, { status: 204 })
}
