interface AuthLayoutProps {
  children: React.ReactNode
}

const NODES = [
  { id: "gateway", x: 140, y: 30, label: "API Gateway", accent: true, delay: "0s" },
  { id: "client", x: 32, y: 100, label: "Client", accent: false, delay: "0s" },
  { id: "auth", x: 248, y: 100, label: "Auth Svc", accent: false, delay: "0s" },
  { id: "api", x: 140, y: 120, label: "API Service", accent: true, delay: "0.9s" },
  { id: "queue", x: 42, y: 195, label: "Queue", accent: false, delay: "0s" },
  { id: "db", x: 140, y: 212, label: "Database", accent: true, delay: "1.8s" },
  { id: "cache", x: 238, y: 195, label: "Cache", accent: false, delay: "0s" },
] as const

const EDGES: [string, string][] = [
  ["client", "gateway"],
  ["gateway", "auth"],
  ["gateway", "api"],
  ["api", "queue"],
  ["api", "db"],
  ["api", "cache"],
]

const FEATURES = [
  "AI-generated architecture from natural language",
  "Real-time collaborative canvas",
  "One-click technical specification export",
]

function ArchGraph() {
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]))

  return (
    <svg
      viewBox="0 0 280 248"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[260px]"
      aria-hidden="true"
    >
      {EDGES.map(([from, to], i) => {
        const a = nodeMap[from]
        const b = nodeMap[to]
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--border-subtle)"
            strokeWidth="1"
            className="auth-edge"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        )
      })}

      {NODES.map((node) => (
        <g key={node.id}>
          {node.accent && (
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill="var(--accent-primary)"
              className="auth-node-glow"
              style={{ animationDelay: node.delay }}
            />
          )}
          <circle
            cx={node.x}
            cy={node.y}
            r="11"
            fill={node.accent ? "var(--accent-primary-dim)" : "var(--bg-elevated)"}
            stroke={node.accent ? "var(--accent-primary)" : "var(--border-default)"}
            strokeWidth="1"
            className={node.accent ? "auth-node-pulse" : ""}
            style={{ animationDelay: node.delay }}
          />
          <text
            x={node.x}
            y={node.y + 23}
            textAnchor="middle"
            fill="var(--text-faint)"
            fontSize="8"
            fontFamily="var(--font-geist-sans)"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function GhostMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
    <>
      <style>{`
        @keyframes auth-node-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
        @keyframes auth-node-glow {
          0%, 100% { opacity: 0.045; }
          50%       { opacity: 0.11;  }
        }
        @keyframes auth-edge {
          to { stroke-dashoffset: -28; }
        }
        .auth-node-pulse {
          animation: auth-node-pulse 2.8s ease-in-out infinite;
        }
        .auth-node-glow {
          animation: auth-node-glow 2.8s ease-in-out infinite;
        }
        .auth-edge {
          stroke-dasharray: 5 9;
          animation: auth-edge 3.6s linear infinite;
        }
      `}</style>

      <div className="flex min-h-screen bg-base">
        {/* ── Left 50 % ─────────────────────────────────── */}
        <div className="relative hidden overflow-hidden border-r border-surface-border bg-surface lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:px-16 lg:py-14">

          {/* Dot-grid canvas texture */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, var(--border-default) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              opacity: 0.045,
            }}
          />

          {/* Teal ambient — bottom-left */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[560px] w-[560px]"
            style={{
              background:
                "radial-gradient(circle, var(--accent-primary) 0%, transparent 68%)",
              opacity: 0.055,
              transform: "translate(-38%, 32%)",
            }}
          />

          {/* Violet ambient — top-right */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-[380px] w-[380px]"
            style={{
              background:
                "radial-gradient(circle, var(--accent-ai) 0%, transparent 65%)",
              opacity: 0.04,
              transform: "translate(32%, -32%)",
            }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <GhostMark />
            <span className="text-[15px] font-semibold tracking-tight text-copy-primary">
              Ghost AI
            </span>
          </div>

          {/* Centre content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
            <ArchGraph />

            <h2 className="mt-10 text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] text-copy-primary">
              Design systems,
              <br />
              <span style={{ color: "var(--accent-primary)" }}>not diagrams.</span>
            </h2>

            <p className="mt-4 max-w-[360px] text-[13.5px] leading-[1.75] text-copy-muted">
              Describe your architecture in plain English. Ghost AI maps it onto
              a shared canvas and generates a production-ready technical
              specification.
            </p>

            <ul className="mt-8 space-y-3.5">
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

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-[11px] uppercase tracking-widest text-copy-faint">
              Real-time · Collaborative · AI-native
            </p>
          </div>
        </div>

        {/* ── Right 50 % ────────────────────────────────── */}
        <div className="flex w-full flex-col items-center justify-center bg-base px-6 py-12 lg:w-1/2">
          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <GhostMark />
            <span className="text-[15px] font-semibold tracking-tight text-copy-primary">
              Ghost AI
            </span>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
