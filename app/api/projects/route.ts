import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId! },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return Response.json(projects)
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawBody = await request.text()
  let body: Record<string, unknown> = {}
  if (rawBody.trim().length > 0) {
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
  }

  const name: string =
    typeof body?.name === 'string' && body.name.trim().length > 0
      ? body.name.trim()
      : 'Untitled Project'

  const id: string | undefined =
    typeof body?.id === 'string' && body.id.trim().length > 0
      ? body.id.trim()
      : undefined

  if (id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return Response.json({ error: 'Invalid project id' }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: { ...(id ? { id } : {}), ownerId: userId!, name },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return Response.json(project, { status: 201 })
}
