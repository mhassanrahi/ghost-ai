import { task, metadata } from "@trigger.dev/sdk"
import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})
import { z } from "zod"
import { mutateFlow } from "@liveblocks/react-flow/node"
import liveblocks from "@/lib/liveblocks"
import { NODE_SHAPES, NODE_COLORS, DEFAULT_NODE_COLOR } from "@/types/canvas"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

const AI_USER_ID = "ghost-ai"
const AI_USER_INFO = { name: "Ghost AI", avatar: "", color: "#6457f9" }

// ── Zod schemas ─────────────────────────────────────────────────────────────

const NodeShapeSchema = z.enum([
  "rectangle", "diamond", "circle", "pill", "cylinder", "hexagon",
])

const NodeColorFillSchema = z.enum([
  "#1F1F1F", "#10233D", "#2E1938", "#331B00",
  "#3C1618", "#3A1726", "#0F2E18", "#062822",
] as const)

const PositionSchema = z.object({ x: z.number(), y: z.number() })

const NodeInputSchema = z.object({
  id: z.string(),
  position: PositionSchema,
  data: z.object({
    label: z.string(),
    color: NodeColorFillSchema,
    shape: NodeShapeSchema,
  }),
})

const EdgeInputSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({ label: z.string().optional() }).optional(),
})

const CanvasDesignSchema = z.object({
  actions: z.array(
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("add_node"), node: NodeInputSchema }),
      z.object({ type: z.literal("move_node"), id: z.string(), position: PositionSchema }),
      z.object({ type: z.literal("resize_node"), id: z.string(), width: z.number(), height: z.number() }),
      z.object({
        type: z.literal("update_node_data"),
        id: z.string(),
        data: z.object({
          label: z.string().optional(),
          color: NodeColorFillSchema.optional(),
          shape: NodeShapeSchema.optional(),
        }),
      }),
      z.object({ type: z.literal("delete_node"), id: z.string() }),
      z.object({ type: z.literal("add_edge"), edge: EdgeInputSchema }),
      z.object({ type: z.literal("delete_edge"), id: z.string() }),
    ])
  ),
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildNode(input: z.infer<typeof NodeInputSchema>): CanvasNode {
  const dims = NODE_SHAPES[input.data.shape]
  const colorPair = NODE_COLORS.find((c) => c.fill === input.data.color) ?? DEFAULT_NODE_COLOR
  return {
    id: input.id,
    type: "canvasNode" as const,
    position: input.position,
    data: { label: input.data.label, color: colorPair.fill, shape: input.data.shape },
    width: dims.width,
    height: dims.height,
  }
}

function buildEdge(input: z.infer<typeof EdgeInputSchema>): CanvasEdge {
  return {
    id: input.id,
    type: "canvasEdge" as const,
    source: input.source,
    target: input.target,
    data: input.data ?? {},
  }
}

function buildSystemPrompt(currentStateJson: string): string {
  return `You are Ghost AI, an expert system architect. Create or modify a system design canvas.

## Node Shapes and Sizes
- rectangle: 160×80px — APIs, services, load balancers
- diamond: 160×120px — decision points, gateways
- circle: 80×80px — events, endpoints, clients
- pill: 160×60px — microservices, processes
- cylinder: 100×80px — databases, data stores
- hexagon: 120×100px — external systems, boundaries

## Node Color Fills (exact hex values only)
- "#1F1F1F" — neutral/default (general nodes)
- "#10233D" — blue (APIs, HTTP services, gateways)
- "#2E1938" — purple (messaging, queues, pub/sub)
- "#331B00" — orange (cache, CDN)
- "#3C1618" — red (auth, security)
- "#3A1726" — pink (UI, frontend, clients)
- "#0F2E18" — green (databases, storage)
- "#062822" — teal (monitoring, infra)

## Layout Rules
- Start architecture at approximately x:100, y:100
- Space nodes horizontally ~250px apart for parallel services
- Space nodes vertically ~200px apart for layers
- Flow left-to-right for pipelines, top-to-bottom for layered architectures

## Node and Edge IDs
- Use descriptive kebab-case: "api-gateway", "user-service", "postgres-db"
- Edge IDs: "edge-{source}-{target}"

## Current Canvas
${currentStateJson}

## Rules
- Only add nodes/edges not already in the canvas (check existing IDs)
- Modify existing nodes only if the user explicitly requests changes to them
- Every edge must reference node IDs that exist in the canvas after your actions
- Produce at least 3 nodes for any architecture request
- Use the most semantically appropriate shape and color for each component`
}

// ── Task ─────────────────────────────────────────────────────────────────────

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    const { prompt, roomId } = payload

    // Set AI presence — thinking
    await liveblocks.setPresence(roomId, {
      userId: AI_USER_ID,
      data: { cursor: { x: 0, y: 0 }, thinking: true },
      userInfo: AI_USER_INFO,
      ttl: 120,
    })

    await liveblocks.broadcastEvent(roomId, {
      type: "AI_STATUS",
      status: "start",
      message: "Ghost AI is analyzing your prompt…",
    })
    await metadata.set("status", "Analyzing your prompt…")

    try {
      await mutateFlow<CanvasNode, CanvasEdge>(
        { client: liveblocks, roomId },
        async (flow) => {
          const currentNodes = [...flow.nodes]
          const currentEdges = [...flow.edges]

          await liveblocks.broadcastEvent(roomId, {
            type: "AI_STATUS",
            status: "processing",
            message: "Generating your system design…",
          })
          await metadata.set("status", "Generating design…")

          const currentStateJson = JSON.stringify({
            nodes: currentNodes.map((n) => ({
              id: n.id,
              label: n.data.label,
              shape: n.data.shape,
              color: n.data.color,
              position: n.position,
            })),
            edges: currentEdges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          })

          const { object } = await generateObject({
            model: google("gemini-2.0-flash"),
            schema: CanvasDesignSchema,
            system: buildSystemPrompt(currentStateJson),
            prompt,
          })

          for (const action of object.actions) {
            switch (action.type) {
              case "add_node":
                flow.addNode(buildNode(action.node))
                break
              case "move_node":
                flow.updateNode(action.id, { position: action.position })
                break
              case "resize_node":
                flow.updateNode(action.id, { width: action.width, height: action.height })
                break
              case "update_node_data":
                flow.updateNodeData(action.id, action.data)
                break
              case "delete_node":
                flow.removeNode(action.id)
                break
              case "add_edge":
                flow.addEdge(buildEdge(action.edge))
                break
              case "delete_edge":
                flow.removeEdge(action.id)
                break
            }
          }
        }
      )

      await liveblocks.broadcastEvent(roomId, {
        type: "AI_STATUS",
        status: "complete",
        message: "Design complete!",
      })
      await metadata.set("status", "Complete")

      // Clear AI presence
      await liveblocks.setPresence(roomId, {
        userId: AI_USER_ID,
        data: { cursor: null, thinking: false },
        userInfo: AI_USER_INFO,
        ttl: 2,
      })

      return { success: true }
    } catch (error) {
      await Promise.allSettled([
        liveblocks.broadcastEvent(roomId, {
          type: "AI_STATUS",
          status: "error",
          message: "Something went wrong. Please try again.",
        }),
        liveblocks.setPresence(roomId, {
          userId: AI_USER_ID,
          data: { cursor: null, thinking: false },
          userInfo: AI_USER_INFO,
          ttl: 2,
        }),
      ])
      try { metadata.set("status", "Error") } catch { /* ignore */ }

      throw error
    }
  },
})
