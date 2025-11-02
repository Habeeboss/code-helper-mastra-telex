const express = require("express");
require("dotenv").config();
const cors = require("cors");
const routes = require("./routes/index.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use("/api", routes);

app.use((error, req, res, next) => {
  console.error('Global error handler:', error.message);
  
  if (error.message === 'Invalid JSON') {
    return res.status(400).json({
      reply: 'Invalid JSON format in request.',
      timestamp: new Date().toISOString(),
      error: true,
      agent: 'code_helper_telex'
    });
  }
  
  res.status(500).json({
    reply: 'Internal server error. Please try again later.',
    timestamp: new Date().toISOString(),
    error: true,
    agent: 'code_helper_telex'
  });
});

app.use((req, res) => {
  res.status(404).json({
    reply: 'Endpoint not found. Use POST /api/a2a/agent/codeHelper',
    timestamp: new Date().toISOString(),
    error: true,
    agent: 'code_helper_telex'
  });
});

app.get("/", (req, res) => {
  res.json({
    message: " Code Helper Mastra Telex is running!",
    status: "active",
    endpoints: {
      a2a: "/api/a2a/agent/codeHelper",
      health: "/api/health"
    },
    version: "1.0.0"
  });
});

app.listen(PORT, () => {
  console.log(` Code Helper Agent running on port ${PORT}`);
  console.log(` A2A Endpoint: http://localhost:${PORT}/api/a2a/agent/codeHelper`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(` Using Gemini AI: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No API Key'}`);
});