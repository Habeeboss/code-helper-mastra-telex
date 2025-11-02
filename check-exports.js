import * as Mastra from "@mastra/core";

console.log("🔍 Mastra exports:", Object.keys(Mastra));

// Check common patterns
const functionExports = Object.keys(Mastra).filter(key => typeof Mastra[key] === 'function');
console.log("🔧 Function exports:", functionExports);