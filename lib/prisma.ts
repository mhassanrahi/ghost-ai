import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  if (url.startsWith('prisma+postgres://')) {
    // Accelerate — requires @prisma/extension-accelerate at runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withAccelerate } = require('@prisma/extension-accelerate')
    return new PrismaClient({ accelerateUrl: url }).$extends(
      withAccelerate(),
    ) as unknown as PrismaClient
  }

  const adapter = new PrismaPg(new Pool({ connectionString: url }))
  return new PrismaClient({ adapter })
}

function getPrisma(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = buildClient()
  }
  return globalThis.prisma
}

export default new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient]
  },
})
