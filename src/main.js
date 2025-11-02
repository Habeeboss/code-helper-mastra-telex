import express from "express";
import { mastra, CodeHelperService, mastraAvailable } from "./mastra/index.js";
import routes from "./routes/index.js";

const app = express();
app.use(express.json());

// Use routes
app.use("/api", routes);

const PORT = process.env.PORT || 4040;

app.listen(PORT, () => {
  console.log(`🚀 Code Helper Telex running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Mastra framework: ${mastraAvailable ? '✅ Available' : '❌ Not available (Using Gemini)'}`);
  console.log(`🔧 A2A Endpoint: http://localhost:${PORT}/api/a2a/agent/codeHelper`);
  console.log(`📦 Mastra instance: ${mastra ? '✅ Created' : '❌ Not created'}`);
});