import { tasks } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access";
import type { designAgentTask } from "@/trigger/design-agent";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt =
    typeof body.prompt === "string" && body.prompt.trim().length > 0
      ? body.prompt.trim()
      : null;
  const roomId =
    typeof body.roomId === "string" && body.roomId.trim().length > 0
      ? body.roomId.trim()
      : null;
  const projectId =
    typeof body.projectId === "string" && body.projectId.trim().length > 0
      ? body.projectId.trim()
      : null;

  if (!prompt || !roomId || !projectId) {
    return Response.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 }
    );
  }

  const project = await getProjectIfAccessible(projectId, user.userId, user.email);
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
  });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId: user.userId,
    },
  });

  return Response.json({ runId: handle.id }, { status: 201 });
}
