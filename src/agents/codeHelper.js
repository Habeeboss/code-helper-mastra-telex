let mastra;
try {
  mastra = require('@mastra/core');
} catch (error) {
  console.warn('Mastra import failed, using fallback:', error.message);
  mastra = { agent: () => ({ stream: async () => ({ text: 'Mastra not available' }) }) };
}

const { getGeminiModel } = require("../config/gemini.js");

class CodeHelperService {
  static extractCodeBlocks(text) {
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches.length > 0 ? matches : [text];
  }

  static detectLanguage(code) {
    const patterns = {
      javascript: /(function|const|let|var|=>|console\.log|import |export )/,
      python: /(def |print\(|import |from |#|__init__)/,
      java: /(public|private|class|System\.out\.println|import java)/,
      html: /(<html|<div|<!DOCTYPE|class=)/,
      css: /({|}|;|\.|#|@media)/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        return lang;
      }
    }
    return 'unknown';
  }

  static async generateWithGemini(prompt) {
    try {
      const model = getGeminiModel();
      
      const formattedPrompt = `${prompt}

IMPORTANT FORMATTING INSTRUCTIONS:
- Use clean markdown without backslash escapes
- Use **bold** for section headers  
- Use bullet points • for lists
- Use code blocks with triple backticks and language specification
- Use regular newlines, not \n escapes
- Avoid using backslashes before special characters`;

      const result = await model.generateContent(formattedPrompt);
      let response = result.response.text();
      
      response = this.cleanResponse(response);
      
      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response with Gemini');
    }
  }

 static cleanResponse(text) {
  if (!text) return text;
  
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\`\\`\\`/g, '```')
    .replace(/\\`/g, '`')
    .replace(/\\\*/g, '*')
    .replace(/\\#/g, '#')
    .replace(/\\\\/g, '\\')
    .replace(/\\_/g, '_')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}
static async processMessage(messageText) {
  try {
    if (!messageText?.trim()) {
      return this.getWelcomeMessage();
    }

    const codeBlocks = this.extractCodeBlocks(messageText);
    const primaryCode = codeBlocks[0] || '';

    let codeToAnalyze = primaryCode;
    let detectedLanguage = 'unknown';
    
    if (!primaryCode || primaryCode.length < 5) {
      codeToAnalyze = messageText;
      detectedLanguage = this.detectLanguage(messageText);
    } else {
      detectedLanguage = this.detectLanguage(primaryCode);
    }
    const geminiPrompt = `Analyze this ${detectedLanguage} code:

\`\`\`${detectedLanguage}
${codeToAnalyze}
\`\`\`

User request: ${messageText}

Provide analysis in this format:
Code Explanation
• What the code does
• How it works

Potential Issues
• Bugs, errors, or problems
• Edge cases

Improvement Suggestions
• Better approaches
• Best practices

Examples
• Code examples if helpful

Use clean formatting without backslash escapes.`;

    const aiResponse = await this.generateWithGemini(geminiPrompt);

    return {
      text: aiResponse,
      metadata: {
        agent: 'code_helper_telex',
        language: detectedLanguage,
        timestamp: new Date().toISOString(),
        ai_provider: 'gemini'
      }
    };

  } catch (error) {
    console.error('Error in processMessage:', error);
    return this.getErrorMessage();
  }
}

static getWelcomeMessage() {
  return {
    text: ` Hello there! I am your Code Helper Telex

I can help you with:
• Code Explanation - Understanding what your code does and what you are trying to achieve
• Debugging - I can identify issues, find and fix issues appropriately
• Optimization - I can suggest improvements for better performance, best practices and readability 

How to use:
Simply send me your code snippet and I'll analyze it, find potential issues and suggest improvements!

Try it out! `,
    metadata: {
      agent: 'code_helper_telex',
      timestamp: new Date().toISOString()
    }
  };
}

static async safeProcessMessage(messageText) {
  try {
    if (!messageText || typeof messageText !== 'string') {
      return this.getErrorMessage('Invalid message format');
    }
    
    if (messageText.length > 10000) {
      return this.getErrorMessage('Message too long. Please keep under 10,000 characters.');
    }
    
    const harmfulPatterns = [
      /\.\.\//,
      /<script>/i,
      /eval\(/i,
    ];
    
    for (const pattern of harmfulPatterns) {
      if (pattern.test(messageText)) {
        return this.getErrorMessage('Request contains potentially unsafe content.');
      }
    }
    
    return await this.processMessage(messageText);
    
  } catch (error) {
    console.error('Safe process error:', error);
    return this.getErrorMessage();
  }
}

static async safeProcessMessage(messageText) {
  try {
    if (!messageText || typeof messageText !== 'string') {
      return this.getErrorMessage('Invalid message format');
    }
    
    if (messageText.length > 10000) {
      return this.getErrorMessage('Message too long. Please keep under 10,000 characters.');
    }
    
    return await this.processMessage(messageText);
    
  } catch (error) {
    console.error('Safe process error:', error);
    return this.getErrorMessage();
  }
}

  static getErrorMessage(customMessage = null) {
    return {
      text: customMessage || ' Sorry, I encountered an error processing your code. Please try again.',
      metadata: {
        agent: 'code_helper_telex',
        error: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

let codeHelperAgent;
try {
  codeHelperAgent = mastra.agent({
    name: 'code_helper_telex',
    instructions: 'You are a code assistant...'
  });
} catch (error) {
  console.warn('Mastra agent creation failed, using Gemini directly');
  codeHelperAgent = null;
}

module.exports = { CodeHelperService, codeHelperAgent };