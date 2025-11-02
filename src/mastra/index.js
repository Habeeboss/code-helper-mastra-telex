import { Mastra } from "@mastra/core";
import { CodeHelperService, codeHelperAgent, mastraAvailable } from "../agents/codeHelper.js";

// Verify the exports
console.log("🔍 Mastra index - CodeHelperService:", typeof CodeHelperService);
console.log("🔍 Mastra index - mastraAvailable:", mastraAvailable);

// Create proper Mastra instance (no start method needed)
const mastra = new Mastra({
  agents: [codeHelperAgent]
});

console.log("✅ Mastra instance created successfully");

export { 
  mastra, 
  CodeHelperService,
  mastraAvailable 
};

// Export mastra as default (required for Mastra deployer)
export default mastra;