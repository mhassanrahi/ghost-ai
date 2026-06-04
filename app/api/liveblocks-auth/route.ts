import { currentUser } from "@clerk/nextjs/server"
import { getCurrentUser, getProjectIfAccessible } from "@/lib/project-access"
import liveblocks, { userIdToColor } from "@/lib/liveblocks"

export async function POST(request: Request) {
  const me = await getCurrentUser()
  if (!me) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { room } = await request.json()
  if (!room) {
    return new Response("Missing room", { status: 400 })
  }

  const project = await getProjectIfAccessible(room, me.userId, me.email)
  if (!project) {
    return new Response("Forbidden", { status: 403 })
  }

  const clerkUser = await currentUser()
  const name =
    clerkUser?.fullName ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    "Anonymous"
  const avatar = clerkUser?.imageUrl ?? ""
  const color = userIdToColor(me.userId)

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] })

  await liveblocks.updateRoom(room, {
    usersAccesses: { [me.userId]: ["room:write"] },
  })

  const { status, body } = await liveblocks.identifyUser(me.userId, {
    userInfo: { name, avatar, color },
  })

  return new Response(body, { status })
}
