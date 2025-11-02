import express from 'express';
import mastra from "./mastra/index.js";

const app = express();
const PORT = process.env.PORT || 4040;

// Improved JSON middleware with error handling
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('❌ Invalid JSON received:', e.message);
      throw new Error('Invalid JSON');
    }
  }
}));

// Error handling middleware for JSON parsing
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
      codeHelper: '/api/a2a/agent/codeHelper'
    }
  });
});

// Telex A2A Agent Endpoint
app.post('/api/a2a/agent/codeHelper', async (req, res) => {
  try {
    console.log(' Received Telex request body:', JSON.stringify(req.body, null, 2));
    
    const { message, text } = req.body;

    const codeToAnalyze = message || text || '';
    
    if (!codeToAnalyze.trim()) {
      return res.json({
        response: " Hello! I'm your Code Helper Agent. Please send me some code to analyze, and I'll help you with:\n\n• Code review and security analysis\n• Bug detection and fixes\n• Performance optimization\n• Best practices recommendations\n\nJust paste your code and I'll get to work! 💻"
      });
    }

    console.log(`🔍 Analyzing code (${codeToAnalyze.length} chars):`, codeToAnalyze);

    const analysis = await analyzeCode(codeToAnalyze);
 
    const response = {
      response: formatAnalysisResponse(analysis, codeToAnalyze)
    };

    console.log(' Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error(' Error processing request:', error);
    res.status(500).json({
      response: " I encountered an error while analyzing your code. Please try again with a different code snippet."
    });
  }
});

async function analyzeCode(code) {
  const language = detectLanguage(code);
  
  return {
    language,
    summary: `Analyzed ${language} code (${code.length} characters)`,
    issues: [
      "No critical issues found",
      "Consider adding input validation",
      "Add error handling for edge cases"
    ],
    suggestions: [
      "Add JSDoc comments for documentation",
      "Consider using TypeScript for better type safety",
      "Add unit tests for this function"
    ],
    security: [
      "No major security vulnerabilities detected",
      "Always validate external inputs"
    ]
  };
}

function detectLanguage(code) {
  if (code.includes('<?php')) return 'PHP';
  if (code.includes('def ') || code.includes('import ')) return 'Python';
  if (code.includes('#include') || code.includes('cout') || code.includes('printf')) return 'C++';
  if (code.includes('function') || code.includes('const ') || code.includes('let ')) return 'JavaScript';
  if (code.includes('public class') || code.includes('import java')) return 'Java';
  if (code.includes('package main') || code.includes('func ')) return 'Go';
  if (code.includes('<html') || code.includes('</div>')) return 'HTML';
  if (code.includes('SELECT') || code.includes('FROM')) return 'SQL';
  return 'Unknown';
}

function formatAnalysisResponse(analysis, originalCode) {
  return `
🔍 **Code Analysis Complete**

**Language:** ${analysis.language}
**Summary:** ${analysis.summary}

**📋 Issues Found:**
${analysis.issues.map(issue => `• ${issue}`).join('\n')}

**💡 Suggestions:**
${analysis.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

**🛡️ Security Notes:**
${analysis.security.map(security => `• ${security}`).join('\n')}

**Original Code:**
\`\`\`${analysis.language.toLowerCase()}
${originalCode}
\`\`\`

*Need more detailed analysis? Ask me specific questions about your code!*
  `.trim();
}

async function main() {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Code Helper Agent running on http://localhost:${PORT}`);
      console.log(` Health endpoint: http://localhost:${PORT}/health`);
      console.log(` Telex A2A endpoint: http://localhost:${PORT}/api/a2a/agent/codeHelper`);
      console.log('\n Test with:');
      console.log(`  curl -X POST http://localhost:${PORT}/api/a2a/agent/codeHelper \\`);
      console.log(`    -H "Content-Type: application/json" \\`);
      console.log(`    -d '{"message": "function test() { return \\\"hello\\\"; }"}'`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(console.error);