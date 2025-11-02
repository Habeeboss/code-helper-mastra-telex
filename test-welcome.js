const { CodeHelperService } = require('./src/agents/codeHelper.js');

async function testWelcomeMessage() {
  console.log('🧪 Testing clean welcome message...\n');

  const result = await CodeHelperService.processMessage('');
  
  console.log('📊 WELCOME MESSAGE ANALYSIS:');
  console.log('Contains \\\\` escapes:', result.text.includes('\\`'));
  console.log('Contains \\\\n escapes:', result.text.includes('\\n'));
  console.log('Contains triple backticks:', result.text.includes('```'));
  
  console.log('\n CLEAN WELCOME MESSAGE:');
  console.log('=' .repeat(50));
  console.log(result.text);
  console.log('=' .repeat(50));
  
  console.log('\n CLEANLINESS CHECK:');
  if (!result.text.includes('\\`') && !result.text.includes('\\n')) {
    console.log(' SUCCESS: Welcome message is clean!');
  } else {
    console.log('  WARNING: Some escape sequences still present.');
  }
}

testWelcomeMessage();