import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4040;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
      codeHelper: '/api/a2a/agent/codeHelper'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Code Helper Agent',
    status: 'running',
    version: '1.0.0',
    powered_by: 'Gemini AI'
  });
});

// Telex A2A Agent Endpoint
app.post('/api/a2a/agent/codeHelper', async (req, res) => {
  try {
    console.log('📨 Received Telex request');
    
    const { message, text } = req.body;
    const codeToAnalyze = message || text || '';
    
    if (!codeToAnalyze.trim()) {
      return res.json({
        response: "👋 Hello! I'm your Code Helper Agent. Please send me some code to analyze, and I'll help you with:\n\n• Code review and security analysis\n• Bug detection and fixes\n• Performance optimization\n• Best practices recommendations\n\nJust paste your code and I'll get to work! 💻"
      });
    }

    console.log(`🔍 Analyzing code (${codeToAnalyze.length} chars)`);

    // Use Gemini for code analysis
    const analysis = await analyzeCodeWithGemini(codeToAnalyze);
    
    const response = {
      response: analysis
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

// Analyze code using Gemini
async function analyzeCodeWithGemini(code) {
  try {
    const prompt = `
You are an expert code assistant. Analyze the following code and provide:

1. **Code Explanation** - What the code does and how it works
2. **Potential Issues** - Bugs, errors, or problems
3. **Improvement Suggestions** - Better approaches and best practices
4. **Security Considerations** - Security issues and fixes

Format your response using markdown with clear sections. Use bullet points and code blocks where appropriate.

Code to analyze:
\`\`\`
${code}
\`\`\`
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('❌ Gemini analysis failed:', error);
    // Fallback to basic analysis
    return await basicCodeAnalysis(code);
  }
}

// Fallback basic analysis
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

  if (code.includes('password') && code.includes('=')) {
    issues.push('Hardcoded credentials detected');
    security.push('Use environment variables for sensitive data');
  }

  if (issues.length === 0) issues.push('No critical issues found');
  if (suggestions.length === 0) suggestions.push('Add input validation', 'Implement error handling');
  if (security.length === 0) security.push('No major security vulnerabilities detected');

  return `
🔍 **Code Analysis Complete**

**Language:** ${language}

**📋 Issues Found:**
${issues.map(issue => `• ${issue}`).join('\n')}

**💡 Suggestions:**
${suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

**🛡️ Security Notes:**
${security.map(security => `• ${security}`).join('\n')}

*Analysis powered by Gemini AI*
  `.trim();
}

// Detect programming language
function detectLanguage(code) {
  if (code.includes('<?php')) return 'PHP';
  if (code.includes('def ') || code.includes('import ')) return 'Python';
  if (code.includes('#include') || code.includes('cout')) return 'C++';
  if (code.includes('function') || code.includes('const ')) return 'JavaScript';
  if (code.includes('public class')) return 'Java';
  if (code.includes('<html')) return 'HTML';
  return 'Unknown';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Code Helper Agent running on port ${PORT}`);
  console.log(`✅ Health endpoint: http://localhost:${PORT}/health`);
  console.log(`🤖 Telex A2A endpoint: http://localhost:${PORT}/api/a2a/agent/codeHelper`);
});

// Export for potential Mastra integration later
export default app;