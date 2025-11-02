import express from 'express';
import { Mastra } from "@mastra/core";

const app = express();
const PORT = process.env.PORT || 4040;

// Disable telemetry warnings
globalThis.___MASTRA_TELEMETRY___ = true;

// Create Mastra instance
export const mastra = new Mastra({
  // You can add agents or workflows here if needed
  // agents: {},
  // workflows: {}
});

// Improved JSON middleware
app.use(express.json({
  limit: '10mb'
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
app.post('/api/a2a/agent/codeHelper', async (req, res) => {
  try {
    console.log('📨 Received Telex request');
    
    const { message, text } = req.body;
    
    // Use the code from message or text field
    const codeToAnalyze = message || text || '';
    
    if (!codeToAnalyze.trim()) {
      return res.json({
        response: "👋 Hello! I'm your Code Helper Agent. Please send me some code to analyze, and I'll help you with:\n\n• Code review and security analysis\n• Bug detection and fixes\n• Performance optimization\n• Best practices recommendations\n\nJust paste your code and I'll get to work! 💻"
      });
    }

    console.log(`🔍 Analyzing code (${codeToAnalyze.length} chars)`);

    // Simple code analysis
    const analysis = await analyzeCode(codeToAnalyze);
    
    // Format response for Telex
    const response = {
      response: formatAnalysisResponse(analysis, codeToAnalyze)
    };

    console.log('✅ Analysis complete');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    res.status(500).json({
      response: "❌ I encountered an error while analyzing your code. Please try again with a different code snippet."
    });
  }
});

// Simple code analysis function
async function analyzeCode(code) {
  const language = detectLanguage(code);
  
  // Basic analysis based on code patterns
  const issues = [];
  const suggestions = [];
  const security = [];

  // Check for common issues
  if (code.includes('eval(')) {
    issues.push('Avoid using eval() - it can execute arbitrary code and is a security risk');
    security.push('Replace eval() with safer alternatives like Function constructor or JSON.parse');
  }

  if (code.includes('password') && code.includes('===')) {
    issues.push('Hardcoded credentials detected');
    security.push('Use environment variables for sensitive data like passwords');
  }

  if (code.includes('.innerHTML') && !code.includes('.textContent')) {
    issues.push('Using innerHTML can lead to XSS vulnerabilities');
    security.push('Prefer textContent or use proper sanitization for innerHTML');
  }

  if (code.includes('console.log') && code.length < 100) {
    suggestions.push('Remove console.log statements before production deployment');
  }

  if (!code.includes('function') && !code.includes('=>') && code.includes('{') && code.includes('}')) {
    suggestions.push('Consider adding JSDoc comments for better documentation');
  }

  // Default suggestions if no specific issues found
  if (issues.length === 0) {
    issues.push('No critical issues found');
    suggestions.push('Add input validation for function parameters');
    suggestions.push('Implement error handling with try-catch blocks');
  }

  if (security.length === 0) {
    security.push('No major security vulnerabilities detected');
    security.push('Always validate and sanitize user inputs');
  }

  return {
    language,
    summary: `Analyzed ${language} code (${code.length} characters, ${code.split('\n').length} lines)`,
    issues,
    suggestions,
    security
  };
}

// Detect programming language from code
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

// Format analysis response for Telex
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

// Start server
async function main() {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Code Helper Agent running on port ${PORT}`);
      console.log(`✅ Health endpoint: http://localhost:${PORT}/health`);
      console.log(`🤖 Telex A2A endpoint: http://localhost:${PORT}/api/a2a/agent/codeHelper`);
      console.log(`🔧 Mastra instance exported for cloud deployment`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Export for Mastra Cloud
export default mastra;

main().catch(console.error);