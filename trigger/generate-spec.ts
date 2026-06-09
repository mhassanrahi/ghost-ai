import { task, metadata } from "@trigger.dev/sdk"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { put } from "@vercel/blob"
import { z } from "zod"
import prisma from "@/lib/prisma"

if (!process.env.OPEN_ROUTER_API_KEY) {
  throw new Error("OPEN_ROUTER_API_KEY environment variable is required")
}

if (!process.env.OPEN_ROUTER_MODEL) {
  throw new Error("OPEN_ROUTER_MODEL environment variable is required")
}

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
})

// ── Zod schemas ──────────────────────────────────────────────────────────────

const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
})

const NodeDataSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  shape: z.string().optional(),
})

const NodeSchema = z.object({
  id: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: NodeDataSchema,
})

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({ label: z.string().optional() }).optional(),
})

const GenerateSpecPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(ChatMessageSchema),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildPrompt(
  nodes: z.infer<typeof NodeSchema>[],
  edges: z.infer<typeof EdgeSchema>[],
  chatHistory: z.infer<typeof ChatMessageSchema>[]
): string {
  const canvasJson = JSON.stringify(
    {
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.data.label,
        shape: n.data.shape,
        color: n.data.color,
        position: n.position,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.data?.label,
      })),
    },
    null,
    2
  )

  const conversationText = chatHistory
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n")

  return `You are Ghost AI, a technical documentation writer. Based on the system design canvas and the conversation history below, generate a detailed Markdown technical specification.

## Canvas State (JSON)
\`\`\`json
${canvasJson}
\`\`\`

## Conversation History
${conversationText || "(No prior conversation)"}

## Instructions
- Write a complete technical specification for this system architecture
- Include sections: Overview, Components, Data Flow, Infrastructure, and Key Decisions
- For each component, describe its purpose, responsibilities, and how it connects to others
- Keep the spec precise, actionable, and suitable for an engineering team
- Output plain Markdown only — no preamble, no explanation outside the spec itself`
}

// ── Task ─────────────────────────────────────────────────────────────────────

export const generateSpecTask = task({
  id: "generate-spec",
  run: async (rawPayload: unknown) => {
    const payload = GenerateSpecPayloadSchema.parse(rawPayload)
    const { projectId, chatHistory, nodes, edges } = payload

    await metadata.set("status", "Analyzing canvas…")

    const prompt = buildPrompt(nodes, edges, chatHistory)

    await metadata.set("status", "Generating specification…")

    const { text } = await generateText({
      model: openrouter(process.env.OPEN_ROUTER_MODEL!),
      prompt,
    })

    await metadata.set("status", "Saving…")

    const blob = await put(
      `specs/${projectId}/${Date.now()}.md`,
      text,
      { access: "private", contentType: "text/markdown", allowOverwrite: false },
    )

    const record = await prisma.projectSpec.create({
      data: { projectId, filePath: blob.url },
    })

    await metadata.set("status", "Complete")

    return { spec: text, specId: record.id }
  },
})
