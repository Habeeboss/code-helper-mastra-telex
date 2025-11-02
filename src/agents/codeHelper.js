import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { getGeminiModel } from "../config/gemini.js";

// Create proper Mastra Agent with the correct structure
export const codeHelperAgent = new Agent({
  name: "code_helper_telex",
  instructions: `
You are an expert code assistant that helps developers with code analysis, debugging, and optimization.

CORE FUNCTIONALITY:
- Analyze code in multiple programming languages
- Identify bugs, errors, and potential issues  
- Suggest improvements and best practices
- Provide code examples and explanations
- Help with debugging and optimization

RESPONSE FORMAT:
- Use clean markdown formatting
- Use **bold** for section headers
- Use bullet points • for lists
- Use code blocks with triple backticks
- Use regular newlines for readability

ANALYSIS STRUCTURE:
**Code Explanation**
• What the code does
• How it works

**Potential Issues**
• Bugs, errors, or problems
• Edge cases

**Improvement Suggestions**
• Better approaches  
• Best practices

**Examples**
• Code examples if helpful

LANGUAGES SUPPORTED:
JavaScript, Python, Java, TypeScript, HTML, CSS, Go, Rust, PHP, and more.
`,
  model: "gemini-2.0-flash-exp",
  // Define tools directly in the agent configuration
  tools: {
    analyzeCode: {
      description: "Analyze code for issues, improvements, and security considerations",
      parameters: z.object({
        code: z.string().describe("The code to analyze"),
        language: z.string().optional().describe("Programming language of the code"),
      }),
      execute: async ({ context }) => {
        try {
          const { code, language } = context.parameters;
          const detectedLanguage = language || detectLanguage(code);
          
          console.log(`🔍 Analyzing ${detectedLanguage} code (${code.length} chars)`);
          
          // Use Gemini for AI-powered analysis
          const geminiModel = getGeminiModel("gemini-2.0-flash-exp");
          const prompt = createAnalysisPrompt(code, detectedLanguage);
          
          const result = await geminiModel.generateContent(prompt);
          const analysis = await result.response.text();
          
          // Parse the AI response into structured data
          const structuredAnalysis = parseAnalysisResponse(analysis, code, detectedLanguage);
          
          return {
            analysis: structuredAnalysis.formattedResponse,
            language: detectedLanguage,
            issues: structuredAnalysis.issues,
            suggestions: structuredAnalysis.suggestions,
            security: structuredAnalysis.security,
          };
          
        } catch (error) {
          console.error("❌ AI analysis failed:", error.message);
          // Fallback to basic analysis
          return await basicCodeAnalysis(context.parameters.code);
        }
      }
    }
  }
});

// Helper function to create analysis prompt
function createAnalysisPrompt(code, language) {
  return `
As an expert code analyst, please provide a comprehensive review of the following ${language} code:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Please structure your analysis with these sections:

**🔍 Code Explanation**
- Explain what the code does in simple terms
- Describe how it works and its main components
- Identify the programming paradigm and key functions

**⚠️ Potential Issues**
- List any bugs, errors, or logical problems
- Identify edge cases that aren't handled
- Point out performance bottlenecks or inefficiencies
- Note any compatibility or dependency issues

**💡 Improvement Suggestions**
- Suggest better coding practices
- Recommend optimizations for performance
- Propose better architecture or patterns
- Suggest ways to improve readability and maintainability

**🛡️ Security Considerations**
- Identify potential security vulnerabilities
- Suggest input validation and sanitization
- Recommend security best practices
- Point out any data protection concerns

**📝 Examples** (if helpful)
- Provide improved code snippets
- Show alternative approaches
- Demonstrate best practices

Please use clear markdown formatting with bullet points and code blocks where appropriate.
`;
}

// Helper function to parse AI response into structured data
function parseAnalysisResponse(analysis, originalCode, language) {
  // Extract sections from the AI response
  const issues = extractSection(analysis, "issues", ["No critical issues found"]);
  const suggestions = extractSection(analysis, "suggestions", ["Add comprehensive error handling"]);
  const security = extractSection(analysis, "security", ["No major security vulnerabilities detected"]);
  
  // Format the final response for Telex
  const formattedResponse = `
${analysis}

**Original Code Analyzed:**
\`\`\`${language.toLowerCase()}
${originalCode}
\`\`\`

*Analysis powered by Mastra AI with Gemini*
  `.trim();
  
  return {
    formattedResponse,
    issues,
    suggestions,
    security,
  };
}

// Helper to extract sections from AI response
function extractSection(text, sectionType, fallback) {
  const sectionPatterns = {
    issues: [/issues?[:]?\s*\n([^*]+)/i, /potential issues?[:]?\s*\n([^*]+)/i],
    suggestions: [/suggestions?[:]?\s*\n([^*]+)/i, /improvements?[:]?\s*\n([^*]+)/i],
    security: [/security[:]?\s*\n([^*]+)/i, /vulnerabilities?[:]?\s*\n([^*]+)/i]
  };
  
  for (const pattern of sectionPatterns[sectionType] || []) {
    const match = text.match(pattern);
    if (match) {
      const items = match[1].split('\n')
        .map(line => line.replace(/^[•\-*\s]+/, '').trim())
        .filter(line => line.length > 0);
      return items.length > 0 ? items : fallback;
    }
  }
  
  return fallback;
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

  if ((code.includes('password') || code.includes('api_key')) && code.includes('=')) {
    issues.push('Hardcoded credentials detected');
    security.push('Use environment variables for sensitive data');
  }

  if (code.includes('.innerHTML') && !code.includes('.textContent')) {
    issues.push('Using innerHTML can lead to XSS vulnerabilities');
    security.push('Prefer textContent or use proper sanitization');
  }

  if (issues.length === 0) issues.push('No critical issues found');
  if (suggestions.length === 0) suggestions.push('Add input validation', 'Implement error handling');
  if (security.length === 0) security.push('No major security vulnerabilities detected');

  return {
    analysis: createBasicAnalysisResponse(language, issues, suggestions, security, code),
    language,
    issues,
    suggestions,
    security,
  };
}

function createBasicAnalysisResponse(language, issues, suggestions, security, code) {
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

*Basic analysis - Add Gemini API key for AI-powered analysis*
  `.trim();
}

// Detect programming language
function detectLanguage(code) {
  const codeSample = code.toLowerCase();
  
  if (codeSample.includes('<?php')) return 'PHP';
  if (codeSample.includes('def ') || codeSample.includes('import ') || codeSample.includes('print(')) return 'Python';
  if (codeSample.includes('#include') || codeSample.includes('cout') || codeSample.includes('printf(')) return 'C++';
  if (codeSample.includes('function') || codeSample.includes('const ') || codeSample.includes('let ')) return 'JavaScript';
  if (codeSample.includes('public class') || codeSample.includes('import java')) return 'Java';
  if (codeSample.includes('package main') || codeSample.includes('func ')) return 'Go';
  if (codeSample.includes('using system') || codeSample.includes('namespace ')) return 'C#';
  if (codeSample.includes('<html') || codeSample.includes('</div>')) return 'HTML';
  if (codeSample.includes('select ') || codeSample.includes('from ')) return 'SQL';
  
  return 'Unknown';
}

export default codeHelperAgent;