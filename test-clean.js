const { CodeHelperService } = require('./src/agents/codeHelper.js');

async function testCleanResponse() {
  console.log('🧪 Testing clean response formatting...\n');
  
  const testMessage = "Explain this code: ```javascript\nfunction test() { return 'hello'; }\n```";
  
  try {
    const result = await CodeHelperService.processMessage(testMessage);
    
    console.log('📊 RESPONSE ANALYSIS:');
    console.log('Total length:', result.text.length);
    console.log('Contains \\\\n escapes:', result.text.includes('\\n'));
    console.log('Contains \\\\` escapes:', result.text.includes('\\`'));
    console.log('Contains \\\\* escapes:', result.text.includes('\\*'));
    console.log('Contains \\\\# escapes:', result.text.includes('\\#'));
    
    console.log('\n🔍 RESPONSE PREVIEW (first 300 characters):');
    console.log('=' .repeat(50));
    console.log(result.text.substring(0, 300) + '...');
    console.log('=' .repeat(50));
    
    console.log('\n CLEANLINESS CHECK:');
    if (!result.text.includes('\\n') && !result.text.includes('\\`') && !result.text.includes('\\*')) {
      console.log(' SUCCESS: Response is clean! No escape sequences found.');
    } else {
      console.log('  WARNING: Some escape sequences still present.');
    }
    
  } catch (error) {
    console.error(' Test failed:', error);
  }
}

function testCleanMethod() {
  console.log('\n🧪 Testing cleanResponse method directly...');
  
  const dirtyText = "This has \\n newlines and \\`backticks\\` and **bold** with \\*escapes\\*";
  const cleanText = CodeHelperService.cleanResponse(dirtyText);
  
  console.log('Original:', dirtyText);
  console.log('Cleaned: ', cleanText);
  console.log('Method working:', !cleanText.includes('\\n') && !cleanText.includes('\\`'));
}

testCleanResponse();
setTimeout(testCleanMethod, 1000);