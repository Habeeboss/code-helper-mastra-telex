import { Mastra } from "@mastra/core";

// Disable telemetry warnings
globalThis.___MASTRA_TELEMETRY___ = true;

// Create Mastra instance with proper configuration
export const mastra = new Mastra({
  // Add any agents or workflows here
  workflows: {
    // You can define workflows here if needed
  }
});

// Export for Mastra Cloud
export default mastra;