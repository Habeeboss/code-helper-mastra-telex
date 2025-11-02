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
  const mastraStatus = mastra?.agents?.codeHelper ? '✅ Active' : '❌ Not available';
  
  res.json({ 
    status: 'OK', 
    message: 'Code Helper Agent is running',
    timestamp: new Date().toISOString(),
    mastra_agent: mastraStatus,
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
    mastra_available: !!mastra?.agents?.codeHelper
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

    let analysisResult;
    
    // Try to use Mastra agent if available
    if (mastra?.agents?.codeHelper) {
      console.log('🔄 Using Mastra agent for analysis...');
      try {
        // Use getTools() to avoid deprecation warning
        const tools = mastra.agents.codeHelper.getTools ? mastra.agents.codeHelper.getTools() : mastra.agents.codeHelper.tools;
        
        if (tools?.analyzeCode) {
          // Use the simplest parameter format that should work
          const result = await tools.analyzeCode.execute({
            code: codeToAnalyze,
            language: detectLanguage(codeToAnalyze)
          });
          
          analysisResult = result.analysis;
          console.log('✅ Mastra analysis successful');
        } else {
          throw new Error('AnalyzeCode tool not available');
        }
      } catch (mastraError) {
        console.error('❌ Mastra analysis failed:', mastraError.message);
        analysisResult = await basicCodeAnalysis(codeToAnalyze);
        analysisResult += "\n\n*Note: Using fallback analysis*";
      }
    } else {
      console.log('🔄 Mastra not available, using basic analysis');
      analysisResult = await basicCodeAnalysis(codeToAnalyze);
    }

    const response = {
      response: analysisResult
    };

    console.log('✅ Analysis complete');
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error processing request:', error.message);
    const fallbackAnalysis = await basicCodeAnalysis(codeToAnalyze || '');
    res.json({
      response: fallbackAnalysis + "\n\n*Note: Error occurred, using fallback analysis*"
    });
  }
});

// Basic code analysis function (fallback)
async function basicCodeAnalysis(code) {
  const language = detectLanguage(code);
  
  const issues = [];
  const suggestions = [];
  const security = [];

  // Basic pattern checks
  if (code.includes('eval(')) {
    issues.push('Avoid using eval() - security risk');
    security.push('Replace eval() with safer alternatives');
  }

  if ((code.includes('password') || code.includes('api_key')) && code.includes('=')) {
    issues.push('Hardcoded credentials detected');
    security.push('Use environment variables for sensitive data');
  }

  if (issues.length === 0) issues.push('No critical issues found');
  if (suggestions.length === 0) suggestions.push('Add input validation', 'Implement error handling');
  if (security.length === 0) security.push('No major security vulnerabilities detected');

  return `
🔍 **Basic Code Analysis**

**Language:** ${language}

**📋 Issues Found:**
${issues.map(issue => `• ${issue}`).join('\n')}

**💡 Suggestions:**
${suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

**🛡️ Security Notes:**
${security.map(sec => `• ${sec}`).join('\n')}

**Original Code:**
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

*Powered by Code Helper Agent*
  `.trim();
}

// Helper function for language detection
function detectLanguage(code) {
  const codeSample = code.toLowerCase();
  if (codeSample.includes('<?php')) return 'PHP';
  if (codeSample.includes('def ') || codeSample.includes('import ')) return 'Python';
  if (codeSample.includes('#include') || codeSample.includes('cout')) return 'C++';
  if (codeSample.includes('function') || codeSample.includes('const ')) return 'JavaScript';
  if (codeSample.includes('public class')) return 'Java';
  if (codeSample.includes('<html') || codeSample.includes('</div>')) return 'HTML';
  return 'Unknown';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Code Helper Agent running on port ${PORT}`);
  console.log(`✅ Health endpoint: http://localhost:${PORT}/health`);
  console.log(`🤖 Telex A2A endpoint: http://localhost:${PORT}/a2a/agent/codeHelper`);
  
  // Check Mastra status
  if (mastra?.agents?.codeHelper) {
    console.log(`🔧 Mastra integration: ✅ Active`);
    const tools = mastra.agents.codeHelper.getTools ? mastra.agents.codeHelper.getTools() : mastra.agents.codeHelper.tools;
    console.log(`🔧 Available tools:`, Object.keys(tools || {}));
  } else {
    console.log(`🔧 Mastra integration: ❌ Not available (using fallback)`);
  }
});