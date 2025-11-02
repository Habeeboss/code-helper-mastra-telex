const express = require("express");
// Import directly from the agent file
const { CodeHelperService, mastraAvailable } = require("../agents/codeHelper.js");

const router = express.Router();

// Debug direct import
console.log("🔍 Direct import - CodeHelperService:", typeof CodeHelperService);
console.log("🔍 Direct import - processMessage:", typeof CodeHelperService?.processMessage);

router.post("/a2a/agent/codeHelper", async (req, res) => {
  try {
    console.log('📨 Received Telex A2A request');
    
    const { message, text } = req.body;
    const userMessage = message || text || '';
    
    console.log('Processing message:', userMessage.substring(0, 100) + '...');
    
    if (typeof CodeHelperService?.processMessage !== 'function') {
      throw new Error('CodeHelperService.processMessage is not available');
    }
    
    const result = await CodeHelperService.processMessage(userMessage);
    
    const response = {
      reply: result.text,
      timestamp: result.metadata.timestamp,
      agent: result.metadata.agent,
      metadata: {
        mastra_used: result.metadata.mastra_used || false,
        mastra_available: mastraAvailable,
        provider: result.metadata.provider || 'gemini-2.5-flash',
        processing_engine: result.metadata.processing_engine || 'gemini',
        ...(result.metadata.fallback_used && { fallback_used: true }),
        ...(result.metadata.welcome && { welcome: true }),
        ...(result.metadata.error && { error: true })
      }
    };
    
    console.log('✅ Sending A2A response');
    res.json(response);
    
  } catch (error) {
    console.error('❌ A2A endpoint error:', error.message);
    
    res.status(500).json({
      reply: 'Service temporarily unavailable. Please try again.',
      timestamp: new Date().toISOString(),
      agent: 'code_helper_telex',
      error: true
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    agent: "code_helper_telex",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;