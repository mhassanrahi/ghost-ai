import Link from "next/link"
import { Lock } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-base">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elevated">
        <Lock className="size-5 text-copy-muted" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-base font-semibold text-copy-primary">
          Access denied
        </h1>
        <p className="text-sm text-copy-muted">
          This project doesn&apos;t exist or you don&apos;t have access.
        </p>
      </div>
      <Link href="/editor" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to projects
      </Link>
    </div>
  )
}
