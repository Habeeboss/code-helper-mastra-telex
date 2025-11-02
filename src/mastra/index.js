import { Mastra } from "@mastra/core";
import { codeHelperAgent } from "../agents/codeHelper.js";

// Disable telemetry warnings
globalThis.___MASTRA_TELEMETRY___ = true;

console.log("🔧 Initializing Mastra with Code Helper Agent...");

// Create Mastra instance - try different approaches
let mastra;

try {
  // Approach 1: Standard registration
  mastra = new Mastra({
    agents: {
      codeHelper: codeHelperAgent,
    },
  });
  console.log("✅ Mastra instance created with agent registration");
} catch (error) {
  console.error("❌ Standard registration failed:", error.message);
  
  // Approach 2: Create empty then register
  try {
    mastra = new Mastra();
    console.log("✅ Mastra instance created (empty)");
  } catch (error2) {
    console.error("❌ Empty Mastra creation failed:", error2.message);
    // Final fallback
    mastra = { agents: {} };
    console.log("✅ Using fallback Mastra instance");
  }
}

// Manual agent registration if needed
if (!mastra.agents?.codeHelper && codeHelperAgent) {
  console.log("🔄 Attempting manual agent registration...");
  try {
    mastra.agents = mastra.agents || {};
    mastra.agents.codeHelper = codeHelperAgent;
    console.log("✅ Manual agent registration successful");
  } catch (error) {
    console.error("❌ Manual registration failed:", error.message);
  }
}

// Final verification
console.log("🔍 Final agent check:");
console.log("   - Mastra instance:", typeof mastra);
console.log("   - Agents object:", mastra.agents ? "✅ Exists" : "❌ Missing");
console.log("   - Registered agents:", Object.keys(mastra.agents || {}));
console.log("   - Code Helper agent:", mastra.agents?.codeHelper ? "✅ Available" : "❌ Not available");

if (mastra.agents?.codeHelper) {
  console.log("   - Agent tools:", Object.keys(mastra.agents.codeHelper.tools || {}));
}

export { mastra };
export default mastra;