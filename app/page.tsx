import Link from "next/link"

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Link
        href="/editor"
        className="text-sm text-copy-muted underline-offset-4 hover:text-copy-primary hover:underline"
      >
        Open Editor
      </Link>
    </div>
  )
}
