import { Agent } from "@mastra/core/agent";
import { z } from "zod";
import { getGeminiModel } from "../config/gemini.js";

// Create Mastra Agent with tools defined in the constructor
export const codeHelperAgent = new Agent({
  name: "code_helper_telex",
  instructions: `
You are an expert code assistant that helps developers with code analysis, debugging, and optimization.

Provide comprehensive code analysis with:
- Code explanation
- Bug detection and potential issues
- Improvement suggestions
- Security considerations
- Best practices recommendations

Use clear markdown formatting with sections and bullet points.
`,
  model: "gemini-2.0-flash-exp",
  
  // Define tools directly in the agent configuration
  tools: {
    analyzeCode: {
      description: "Analyze code for issues, improvements, and security considerations",
      parameters: z.object({
        code: z.string().describe("The code to analyze"),
        language: z.string().optional().describe("Programming language")
      }),
      execute: async (input) => {
        console.log("🔄 Tool execution started with input:", JSON.stringify(input, null, 2));
        
        try {
          // Handle ALL possible parameter formats
          let code, language;
          
          // Format 1: Direct parameters { code, language }
          if (input.code) {
            code = input.code;
            language = input.language || "javascript";
          } 
          // Format 2: Nested parameters { parameters: { code, language } }
          else if (input.parameters) {
            code = input.parameters.code;
            language = input.parameters.language || "javascript";
          } 
          // Format 3: Context format { context: { input: { code, language } } }
          else if (input.context?.input) {
            code = input.context.input.code;
            language = input.context.input.language || "javascript";
          }
          // Format 4: Any other format - extract first string as code
          else {
            // Try to find code in any property
            const values = Object.values(input);
            code = values.find(val => typeof val === 'string' && val.length > 0) || "No code provided";
            language = "unknown";
          }
          
          console.log(`🔍 Extracted - Code: ${code.substring(0, 50)}..., Language: ${language}`);
          
          // Use Gemini for AI-powered analysis
          const geminiModel = getGeminiModel("gemini-2.0-flash-exp");
          const prompt = `
As an expert code analyst, please provide a comprehensive review of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Please structure your analysis with these sections:

**🔍 Code Explanation**
- What the code does
- How it works
- Key components and functions

**⚠️ Potential Issues**
- Bugs, errors, or logical problems
- Edge cases not handled
- Performance concerns

**💡 Improvement Suggestions**
- Better coding practices
- Optimizations
- Readability improvements

**🛡️ Security Considerations**
- Security vulnerabilities
- Input validation needs
- Data protection

Use clear markdown formatting with bullet points.
`;

          console.log("🔄 Calling Gemini API...");
          const result = await geminiModel.generateContent(prompt);
          const analysis = await result.response.text();
          console.log("✅ Gemini analysis completed");
          
          return {
            analysis: analysis,
            language: language,
            issues: ["See detailed analysis above"],
            suggestions: ["Review the analysis for specific suggestions"],
            security: ["See security considerations in analysis"]
          };
          
        } catch (error) {
          console.error("❌ Mastra analysis failed:", error.message);
          // Fallback to basic analysis
          return await basicCodeAnalysis(input);
        }
      }
    }
  }
});

// Fallback basic analysis that also handles parameter formats
async function basicCodeAnalysis(input) {
  let code, language;
  
  // Extract code from any format
  if (input.code) {
    code = input.code;
  } else if (input.parameters?.code) {
    code = input.parameters.code;
  } else if (input.context?.input?.code) {
    code = input.context.input.code;
  } else {
    // Find first string
    const values = Object.values(input);
    code = values.find(val => typeof val === 'string') || "No code provided";
  }
  
  language = detectLanguage(code);
  
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

  return {
    analysis: `
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

*Basic analysis - AI service unavailable*
    `.trim(),
    language: language,
    issues: issues,
    suggestions: suggestions,
    security: security
  };
}

// Detect programming language
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

console.log("✅ Code Helper Agent created successfully");
console.log("🔧 Available tools:", Object.keys(codeHelperAgent.tools || {}));

export default codeHelperAgent;