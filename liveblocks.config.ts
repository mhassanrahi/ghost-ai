declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {};

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent:
      | { type: "AI_STATUS"; status: "start" | "processing" | "complete" | "error"; message: string };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
