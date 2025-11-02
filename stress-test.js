const http = require('http');

const testCases = [
  { 
    name: 'Empty message', 
    data: JSON.stringify({ message: '' }),
    expected: 'welcome'
  },
  { 
    name: 'SQL injection', 
    data: JSON.stringify({ message: "'; DROP TABLE users; --" }),
    expected: 'analysis'
  },
  { 
    name: 'Valid code', 
    data: JSON.stringify({ message: "function test() { return true; }" }),
    expected: 'analysis' 
  },
  { 
    name: 'Broken JSON', 
    data: '{"message": "test"',
    expected: 'error'
  },
  { 
    name: 'Nested object', 
    data: JSON.stringify({ message: { code: "test" } }),
    expected: 'error'
  },
  { 
    name: 'Very long message', 
    data: JSON.stringify({ message: 'x'.repeat(15000) }),
    expected: 'error'
  },
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`\n🧪 Testing: ${test.name}`);
    
    try {
      const response = await makeRequest(test.data);
      
      let result;
      try {
        result = JSON.parse(response);
      } catch (parseError) {
        console.log(` FAIL: Response is not valid JSON: ${response.substring(0, 100)}`);
        failed++;
        continue;
      }

      if (test.expected === 'error') {
        if (result.error || result.reply?.includes('error') || result.reply?.includes('Sorry')) {
          console.log(` PASS: Got expected error response`);
          console.log(`   Response: ${result.reply?.substring(0, 100)}...`);
          passed++;
        } else {
          console.log(` FAIL: Expected error but got: ${result.reply?.substring(0, 100)}`);
          failed++;
        }
      } else if (test.expected === 'welcome') {
        if (result.reply?.includes('Hello') || result.reply?.includes('help')) {
          console.log(` PASS: Got welcome message`);
          console.log(`   Response: ${result.reply?.substring(0, 100)}...`);
          passed++;
        } else {
          console.log(` FAIL: Expected welcome but got: ${result.reply?.substring(0, 100)}`);
          failed++;
        }
      } else if (test.expected === 'analysis') {
        if (result.reply && !result.error && result.agent === 'code_helper_telex') {
          console.log(` PASS: Got code analysis`);
          console.log(` Response length: ${result.reply.length} chars`);
          passed++;
        } else {
          console.log(` FAIL: Expected analysis but got error or invalid response`);
          failed++;
        }
      }
      
    } catch (error) {
      if (test.expected === 'error') {
        console.log(` PASS: Got expected error: ${error.message}`);
        passed++;
      } else {
        console.log(` FAIL: ${error.message}`);
        failed++;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n FINAL RESULTS: ${passed} passed, ${failed} failed`);
  console.log(` Success rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  return { passed, failed };
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4040,
      path: '/api/a2a/agent/codeHelper',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 30000 
    }, (res) => {
      let response = '';
      
      res.on('data', (chunk) => {
        response += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${response.substring(0, 200)}`));
        } else {
          resolve(response);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 30 seconds'));
    });
    
    req.write(data);
    req.end();
  });
}

async function checkServer() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4040,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'healthy') {
            console.log(' Server is running and healthy');
            resolve(true);
          } else {
            console.log(' Server responded but not healthy');
            resolve(false);
          }
        } catch (e) {
          console.log(' Server response not valid JSON');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log(' Server is not running on port 4040');
      console.log(' Make sure to run: npm run dev');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(' Server health check timeout');
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log(' Starting Enhanced Stress Tests...');
  console.log(' Checking server status...');
  
  const serverReady = await checkServer();
  if (!serverReady) {
    console.log(' Cannot run tests - server not available');
    process.exit(1);
  }
  
  console.log('\n Running stress tests...');
  const results = await runTests();
  
  if (results.failed > 0) {
    console.log('\n  Some tests failed. Check the implementation.');
    process.exit(1);
  } else {
    console.log('\n All tests passed! Agent is robust and ready for production.');
    process.exit(0);
  }
}

main().catch(console.error);