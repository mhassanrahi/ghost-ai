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

  const body = await request.json().catch(() => ({}))
  const name: string =
    typeof body?.name === 'string' && body.name.trim().length > 0
      ? body.name.trim()
      : 'Untitled Project'

  const project = await prisma.project.create({
    data: { ownerId: userId!, name },
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
