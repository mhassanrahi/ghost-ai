import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

type Context = { params: Promise<{ projectId: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const body = await request.json().catch(() => ({}))
  const name: string | undefined =
    typeof body?.name === 'string' && body.name.trim().length > 0
      ? body.name.trim()
      : undefined

  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return Response.json(updated)
}

export async function DELETE(_request: Request, { params }: Context) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}
