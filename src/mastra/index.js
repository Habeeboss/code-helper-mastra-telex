import { Mastra } from "@mastra/core";
import { codeHelperAgent } from "../agents/codeHelper.js";

// Disable telemetry warnings
globalThis.___MASTRA_TELEMETRY___ = true;

// Create Mastra instance with proper agent registration
export const mastra = new Mastra({
  agents: {
    codeHelper: codeHelperAgent,
  },
});

console.log("✅ Mastra instance created with Code Helper Agent");

// Export for Mastra Cloud
export default mastra;