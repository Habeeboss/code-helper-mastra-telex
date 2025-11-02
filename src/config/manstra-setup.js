const { Mastra } = require("@mastra/core");

// Configure Mastra with proper settings
const mastra = new Mastra({
  // Mastra configuration
  agents: {
    // Define agents here if needed
  }
});

// Helper to create agents
function createMastraAgent(config) {
  try {
    return mastra.createAgent(config);
  } catch (error) {
    console.error("Mastra agent creation failed:", error.message);
    return null;
  }
}

module.exports = { mastra, createMastraAgent };