import { tasks } from "@trigger.dev/sdk/v3"
import prisma from "@/lib/prisma"
import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access"
import type { generateSpecTask } from "@/trigger/generate-spec"

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const roomId =
    typeof body.roomId === "string" && body.roomId.trim().length > 0
      ? body.roomId.trim()
      : null

  if (!roomId) {
    return Response.json({ error: "roomId is required" }, { status: 400 })
  }

  const chatHistory = Array.isArray(body.chatHistory) ? body.chatHistory : []
  const nodes = Array.isArray(body.nodes) ? body.nodes : []
  const edges = Array.isArray(body.edges) ? body.edges : []

  const project = await getProjectIfAccessible(roomId, user.userId, user.email)
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId: user.userId,
    },
  })

  return Response.json({ runId: handle.id }, { status: 201 })
}
