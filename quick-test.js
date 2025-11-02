const http = require('http');

console.log(' Testing health endpoint...');
http.get('http://localhost:4040/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Health response:', data);
    console.log('Status:', res.statusCode);

    testA2A();
  });
}).on('error', (err) => {
  console.log(' Health check failed:', err.message);
});

function testA2A() {
  console.log('\n🧪 Testing A2A endpoint...');
  
  const postData = JSON.stringify({
    message: "function test() { return true; }"
  });

  const req = http.request({
    hostname: 'localhost',
    port: 4040,
    path: '/api/a2a/agent/codeHelper',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('A2A Status:', res.statusCode);
      console.log('A2A Response length:', data.length);
      console.log('A2A Response preview:', data.substring(0, 200));
    });
  });

  req.on('error', (err) => {
    console.log(' A2A test failed:', err.message);
  });

  req.write(postData);
  req.end();
}