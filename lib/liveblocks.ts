import { Liveblocks } from "@liveblocks/node"

const CURSOR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#7986CB",
  "#64B5F6",
  "#4DD0E1",
  "#4DB6AC",
  "#81C784",
  "#AED581",
  "#FFD54F",
  "#FFB74D",
  "#FF8A65",
]

export function userIdToColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

declare global {
  // eslint-disable-next-line no-var
  var liveblocks: Liveblocks | undefined
}

function createLiveblocksClient(): Liveblocks {
  return new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  })
}

function getLiveblocks(): Liveblocks {
  if (!globalThis.liveblocks) {
    globalThis.liveblocks = createLiveblocksClient()
  }
  return globalThis.liveblocks
}

export { getLiveblocks }
export default new Proxy({} as Liveblocks, {
  get(_, prop) {
    return getLiveblocks()[prop as keyof Liveblocks]
  },
})
