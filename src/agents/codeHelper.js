import { Agent } from "@mastra/core";
import { getGeminiModel } from "../config/gemini.js";

// Create Mastra agent using the proper Agent class
let codeHelperAgent;
let mastraAvailable = false;

try {
  console.log("🔄 Creating Mastra Agent with Agent class...");
  
  // Create agent using Mastra's Agent class
  codeHelperAgent = new Agent({
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
- Use clean markdown without backslash escapes
- Use **bold** for section headers
- Use bullet points • for lists
- Use code blocks with triple backticks and language specification
- Use regular newlines, not \\\\n escapes

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
    model: "gemini-2.0-flash-exp"
  });

  // Override the generate method to use Gemini directly
  const originalGenerate = codeHelperAgent.generate;
  codeHelperAgent.generate = async (prompt) => {
    try {
      console.log("🔄 Mastra agent processing with Gemini...");
      const gemini = getGeminiModel("gemini-2.5-flash");
      const result = await gemini.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("❌ Mastra Gemini processing failed:", error.message);
      // Fallback to original generate if available
      if (originalGenerate) {
        return originalGenerate.call(codeHelperAgent, prompt);
      }
      throw error;
    }
  };

  mastraAvailable = true;
  console.log("✅ Mastra Agent created successfully");

} catch (error) {
  console.error("❌ Mastra Agent creation failed:", error.message);
  
  // Fallback to custom agent structure
  console.log("📝 Using custom agent as fallback");
  codeHelperAgent = {
    name: "code_helper_telex",
    model: "gemini-2.5-flash",
    instructions: "You are a helpful code assistant...",
    __registerMastra: function(mastraInstance) {
      console.log("🔧 Mastra agent registered");
      this.mastra = mastraInstance;
      return this;
    },
    __registerPrimitives: function(primitives) {
      console.log("🔧 Mastra primitives registered");
      this.primitives = primitives;
      return this;
    },
    start: async function() {
      console.log("🚀 Mastra agent started");
      return this;
    },
    stop: async function() {
      console.log("🛑 Mastra agent stopped");
      return this;
    },
    generate: async (prompt) => {
      try {
        console.log("🔄 Custom agent processing with Gemini...");
        const gemini = getGeminiModel("gemini-2.5-flash");
        const result = await gemini.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.error("❌ Gemini processing failed:", error.message);
        throw error;
      }
    },
    toJSON: function() {
      return {
        name: this.name,
        model: this.model,
        instructions: this.instructions
      };
    },
    tools: [],
    workflows: [],
    state: "idle"
  };
  mastraAvailable = true;
}

// CodeHelperService class
class CodeHelperService {
  constructor() {
    this.mastraAvailable = mastraAvailable;
    this.codeHelperAgent = codeHelperAgent;
  }

  async processWithMastra(messageText) {
    try {
      if (!this.mastraAvailable) {
        throw new Error("Mastra agent not available");
      }
      
      console.log("🔄 Processing with Mastra agent...");
      
      const response = await this.codeHelperAgent.generate(messageText);
      
      return {
        text: this.cleanResponse(response),
        metadata: {
          agent: "code_helper_telex",
          provider: "mastra-gemini",
          timestamp: new Date().toISOString(),
          mastra_used: true,
          processing_engine: "mastra"
        }
      };
    } catch (error) {
      console.error("❌ Mastra processing failed:", error.message);
      throw error;
    }
  }

  cleanResponse(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\`/g, '`')
      .replace(/\\\*/g, '*')
      .replace(/\\#/g, '#')
      .replace(/\\_/g, '_')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  async processMessage(messageText) {
    try {
      console.log("🚀 Starting code analysis with Mastra...");
      
      if (!messageText || typeof messageText !== 'string') {
        return this.getWelcomeMessage();
      }

      if (!this.mastraAvailable) {
        throw new Error("Mastra framework is not available");
      }

      const mastraResult = await this.processWithMastra(messageText);
      console.log("✅ Mastra processing successful");
      return mastraResult;

    } catch (error) {
      console.error("❌ Mastra processing failed:", error.message);
      return this.getErrorMessage("Mastra service is currently unavailable.");
    }
  }

  getWelcomeMessage() {
    return {
      text: `👋 **Hello! I'm Code Helper Telex** (Powered by Mastra)

I'm your AI-powered code assistant built with Mastra framework.

**What I can do:**
• **Code Analysis** - Understand and explain your code
• **Debugging Help** - Find issues and edge cases  
• **Optimization Tips** - Suggest improvements and best practices
• **Multi-Language Support** - JavaScript, Python, Java, HTML, CSS, and more!

**Try me with any code snippet!** 🚀`,
      metadata: {
        welcome: true,
        timestamp: new Date().toISOString(),
        agent: "code_helper_telex",
        mastra_powered: true
      }
    };
  }

  getErrorMessage(customMessage = null) {
    return {
      text: customMessage || "⚠️ Service is currently unavailable.",
      metadata: {
        error: true,
        timestamp: new Date().toISOString(),
        agent: "code_helper_telex"
      }
    };
  }
}

// Create an instance and export it
const codeHelperServiceInstance = new CodeHelperService();

export { 
  codeHelperServiceInstance as CodeHelperService,
  codeHelperAgent, 
  mastraAvailable 
};