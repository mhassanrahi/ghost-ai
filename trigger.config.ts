import { defineConfig } from "@trigger.dev/sdk/v3";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.TRIGGER_PROJECT_ID) {
  throw new Error("TRIGGER_PROJECT_ID environment variable is required");
}

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID!,
  dirs: ["./trigger"],
  runtime: 'node',
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 1000,
      factor: 2
    }
  }
});
