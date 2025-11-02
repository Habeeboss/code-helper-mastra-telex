const Mastra = require("@mastra/core");

console.log("🔍 Mastra Configuration Check");
console.log("==============================");

// Check Mastra version and exports
try {
  const mastraVersion = require("@mastra/core/package.json").version;
  console.log(`📦 Mastra version: ${mastraVersion}`);
} catch (e) {
  console.log("📦 Mastra version: Unable to determine");
}

console.log("\n🔧 Available exports:");
console.log(Object.keys(Mastra).slice(0, 20)); // Show first 20 exports

// Test if we can create a basic agent without model
console.log("\n🧪 Testing agent creation without model:");
try {
  const agent = new Mastra.Agent({
    name: "test_agent",
    instructions: "You are a helpful assistant."
    // No model specified - let Mastra use default
  });
  console.log("✅ Agent created successfully without model specification");
} catch (error) {
  console.log("❌ Agent creation failed:", error.message);
}

console.log("\n💡 Mastra likely needs:");
console.log("1. API keys in environment variables");
console.log("2. Proper model configuration");
console.log("3. Possibly additional setup");