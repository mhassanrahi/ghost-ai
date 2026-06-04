import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { getOwnedProjects, getSharedProjects } from "@/lib/projects"
import { EditorHome } from "@/components/editor/editor-home"

export default async function EditorPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const emails = user?.emailAddresses?.map((e) => e.emailAddress) ?? []

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(emails),
  ])

  return <EditorHome ownedProjects={ownedProjects} sharedProjects={sharedProjects} />
}
