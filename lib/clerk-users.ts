import { clerkClient } from "@clerk/nextjs/server"

export interface ClerkUserInfo {
  email: string
  displayName: string | null
  imageUrl: string | null
}

export async function enrichEmailsWithClerk(
  emails: string[]
): Promise<ClerkUserInfo[]> {
  if (emails.length === 0) return []

  const client = await clerkClient()
  const { data: users } = await client.users.getUserList({
    emailAddress: emails,
    limit: 100,
  })

  const byEmail = new Map<string, (typeof users)[number]>()
  for (const user of users) {
    for (const ea of user.emailAddresses) {
      const normalized = ea.emailAddress.toLowerCase()
      if (emails.includes(normalized)) {
        byEmail.set(normalized, user)
      }
    }
  }

  return emails.map((email) => {
    const user = byEmail.get(email)
    if (!user) return { email, displayName: null, imageUrl: null }
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || null
    return { email, displayName, imageUrl: user.imageUrl ?? null }
  })
}
