import { z } from "zod"

export const AiStatusFeedPayloadSchema = z.object({
  status: z.string(),
  text: z.string().optional(),
})

export type AiStatusFeedPayload = z.infer<typeof AiStatusFeedPayloadSchema>

export const AiChatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
})

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>
