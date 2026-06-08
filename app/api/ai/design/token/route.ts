import { auth as triggerAuth } from "@trigger.dev/sdk/v3";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/project-access";

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

  const runId =
    typeof body.runId === "string" && body.runId.trim().length > 0
      ? body.runId.trim()
      : null;

  if (!runId) {
    return Response.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  });

  if (!taskRun || taskRun.userId !== user.userId) {
    return Response.json({ error: "Run not found" }, { status: 404 });
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
  });

  return Response.json({ token });
}
