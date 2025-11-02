const express = require("express");
const { CodeHelperService } = require("../agents/codeHelper.js");

const router = express.Router();

const validateInput = (req) => {
  if (!req.body) {
    throw new Error('Request body is required');
  }
  
  const { message, text } = req.body;
  const userMessage = message || text || '';

  if (typeof userMessage !== 'string') {
    throw new Error('Message must be a string');
  }
  
  if (userMessage.length > 10000) {
    throw new Error('Message too long (max 10000 characters)');
  }
  
  return userMessage;
};

const cleanTelexResponse = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\`/g, '`')
    .replace(/\\\*/g, '*')
    .replace(/\\#/g, '#')
    .replace(/\\\\/g, '\\')
    .replace(/\\_/g, '_')
    .trim();
};

router.post("/a2a/agent/codeHelper", async (req, res) => {
  try {
    console.log('📨 Received Telex request');
    
    const { message, text } = req.body;
    const userMessage = message || text || '';
    
    const result = await CodeHelperService.processMessage(userMessage);
    
    const response = {
      reply: result.text,
      timestamp: result.metadata.timestamp,
      agent: result.metadata.agent,
      language: result.metadata.language
    };
    
    console.log(' Sending response');
    res.json(response);
    
  } catch (error) {
    console.error(' A2A endpoint error:', error);
    res.status(500).json({
      reply: 'Internal server error - please try again later.',
      timestamp: new Date().toISOString(),
      error: true
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    agent: "code_helper_telex",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

module.exports = router;