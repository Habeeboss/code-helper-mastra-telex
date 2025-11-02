const express = require("express");
const { mastra, CodeHelperService, mastraAvailable } = require("./mastra/index.js");

const app = express();
app.use(express.json());

// Import and use routes
const routes = require("./routes/index.js");
app.use("/api", routes);

const PORT = process.env.PORT || 4040;

// Initialize Mastra
mastra.start().then(() => {
  console.log("✅ Mastra initialization completed");
}).catch(error => {
  console.error("❌ Mastra initialization error:", error);
});

app.listen(PORT, () => {
  console.log(`🚀 Code Helper Telex running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Mastra framework: ${mastraAvailable ? '✅ Available' : '❌ Not available (Using Gemini)'}`);
  console.log(`🔧 A2A Endpoint: http://localhost:${PORT}/api/a2a/agent/codeHelper`);
});