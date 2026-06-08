import { task } from "@trigger.dev/sdk";

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string }) => {
    console.log("Design agent received payload:", payload);
    return { received: true };
  },
});
