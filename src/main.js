import express from 'express';
import { mastra } from "./mastra/index.js";

const app = express();
const PORT = process.env.PORT || 4040;

// Middleware
app.use(express.json({ limit: '10mb' }));

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    console.error('❌ JSON Syntax Error:', error.message);
    return res.status(400).json({
      response: "Invalid JSON format in request. Please check your input."
    });
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Code Helper Agent is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      codeHelper: '/a2a/agent/codeHelper'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Code Helper Mastra Agent',
    status: 'running',
    version: '1.0.0',
    mastra: true
  });
});

// Telex A2A Agent Endpoint
app.post('/a2a/agent/codeHelper', async (req, res) => {
  try {
    console.log('📨 Received Telex A2A request');
    
    const { message, text } = req.body;
    const codeToAnalyze = message || text || '';
    
    if (!codeToAnalyze.trim()) {
      return res.json({
        response: "👋 Hello! I'm your Code Helper Agent. Please send me some code to analyze, and I'll help you with:\n\n• Code review and security analysis\n• Bug detection and fixes\n• Performance optimization\n• Best practices recommendations\n\nJust paste your code and I'll get to work! 💻"
      });
    }

    console.log(`🔍 Analyzing code (${codeToAnalyze.length} chars)`);

    // Use Mastra agent for analysis - correct tool execution
    const result = await mastra.agents.codeHelper.tools.analyzeCode.execute({
      parameters: {
        code: codeToAnalyze,
        language: detectLanguage(codeToAnalyze)
      }
    });

    // Format response for Telex
    const response = {
      response: result.analysis
    };

    console.log('✅ Mastra analysis complete');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    res.status(500).json({
      response: "❌ I encountered an error while analyzing your code. Please try again with a different code snippet."
    });
  }
});

// Helper function for language detection
function detectLanguage(code) {
  const codeSample = code.toLowerCase();
  if (codeSample.includes('<?php')) return 'PHP';
  if (codeSample.includes('def ') || codeSample.includes('import ')) return 'Python';
  if (codeSample.includes('#include') || codeSample.includes('cout')) return 'C++';
  if (codeSample.includes('function') || codeSample.includes('const ')) return 'JavaScript';
  if (codeSample.includes('public class')) return 'Java';
  return 'Unknown';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mastra Code Helper Agent running on port ${PORT}`);
  console.log(`✅ Health endpoint: http://localhost:${PORT}/health`);
  console.log(`🤖 Telex A2A endpoint: http://localhost:${PORT}/a2a/agent/codeHelper`);
  console.log(`🔧 Mastra integration: ✅ Active`);
});

export default mastra;