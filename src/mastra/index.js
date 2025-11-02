const agentExports = require("../agents/codeHelper.js");

// Destructure the exports properly
const { CodeHelperService, codeHelperAgent, mastraAvailable } = agentExports;

// Verify the exports
console.log("🔍 Mastra index - CodeHelperService:", typeof CodeHelperService);
console.log("🔍 Mastra index - mastraAvailable:", mastraAvailable);

// Simple Mastra wrapper
const mastra = {
  agents: {
    codeHelper: codeHelperAgent
  },
  start: async () => {
    console.log("🔄 Mastra framework initialized");
    return true;
  }
};

module.exports = { 
  mastra, 
  CodeHelperService,
  mastraAvailable 
};