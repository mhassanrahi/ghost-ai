interface AuthLayoutProps {
  children: React.ReactNode
}

const FEATURES = [
  "AI-generated architecture from natural language",
  "Real-time collaborative canvas",
  "One-click technical specification export",
]

function GhostMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="6" fill="var(--accent-primary)" />
      <path
        d="M14 6C9.582 6 6 9.582 6 14c0 2.21.895 4.21 2.343 5.657L7 22l2.343-1.343A7.952 7.952 0 0 0 14 22c4.418 0 8-3.582 8-8s-3.582-8-8-8Z"
        fill="var(--bg-base)"
      />
      <circle cx="11" cy="14" r="1.3" fill="var(--accent-primary)" />
      <circle cx="17" cy="14" r="1.3" fill="var(--accent-primary)" />
    </svg>
  )
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-base">
      {/* Left panel — large screens only */}
      <div className="hidden border-r border-surface-border bg-surface lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16 lg:py-14">
        <div className="mb-10 flex items-center gap-2.5">
          <GhostMark />
          <span className="text-[15px] font-semibold tracking-tight text-copy-primary">
            Ghost AI
          </span>
        </div>

        <h2 className="text-[26px] font-semibold leading-snug tracking-[-0.02em] text-copy-primary">
          Design systems,
          <br />
          not diagrams.
        </h2>

        <p className="mt-4 max-w-[360px] text-[13.5px] leading-[1.7] text-copy-muted">
          Describe your architecture in plain English. Ghost AI maps it onto a
          shared canvas and generates a production-ready technical specification.
        </p>

        <ul className="mt-8 space-y-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-[13px] text-copy-secondary">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--accent-primary)" }}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — form; small screens: full width */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  )
}
