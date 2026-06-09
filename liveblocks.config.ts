import type { AiStatusFeedPayload, AiChatMessage } from "@/types/tasks"
import type { LiveList } from "@liveblocks/client"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      "ai-status-feed": AiStatusFeedPayload | null;
      "ai-chat": LiveList<AiChatMessage>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: { type: "AI_STATUS"; status: "start" | "processing" | "complete" | "error"; message: string };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
