"use client"

import { useOthers } from "@liveblocks/react"
import { useAuth } from "@clerk/nextjs"
import { Panel } from "@xyflow/react"

const MAX_VISIBLE = 5
const AVATAR_SIZE = 28 // px — matches Clerk UserButton default

interface OtherUser {
  connectionId: number
  id?: string
  info: {
    name: string
    avatar: string
    color: string
  }
}

export function PresenceAvatars() {
  const { userId } = useAuth()
  const others = useOthers() as unknown as OtherUser[]

  // Exclude any connection that belongs to the current Clerk user
  const collaborators = others.filter((o) => o.id !== userId)

  const visible = collaborators.slice(0, MAX_VISIBLE)
  const overflowCount = collaborators.length - MAX_VISIBLE

  return (
    <Panel position="top-right">
      <div className="m-2 flex items-center">
        {/* Overlapping avatar stack — rendered right-to-left so first is topmost */}
        <div className="flex items-center">
          {overflowCount > 0 && (
            <OverflowChip count={overflowCount} />
          )}
          {[...visible].reverse().map((other, i) => (
            <div
              key={other.connectionId}
              style={{
                marginLeft: i === 0 && overflowCount <= 0 ? 0 : -8,
                zIndex: visible.length - i,
              }}
            >
              <CollaboratorAvatar other={other} />
            </div>
          ))}
        </div>

      </div>
    </Panel>
  )
}

function CollaboratorAvatar({ other }: { other: OtherUser }) {
  const { info } = other
  const initials = info.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      title={info.name}
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-bg-base"
    >
      {info.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={info.avatar}
          alt={info.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white"
          style={{ backgroundColor: info.color }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

function OverflowChip({ count }: { count: number }) {
  return (
    <div
      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginLeft: -8 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-elevated ring-2 ring-bg-base text-[10px] font-semibold text-copy-muted"
    >
      +{count}
    </div>
  )
}
