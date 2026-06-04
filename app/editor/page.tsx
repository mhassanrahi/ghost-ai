import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getOwnedProjects, getSharedProjects } from "@/lib/projects"
import { EditorHome } from "@/components/editor/editor-home"

export default async function EditorPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ""

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(email),
  ])

  return <EditorHome ownedProjects={ownedProjects} sharedProjects={sharedProjects} />
}
