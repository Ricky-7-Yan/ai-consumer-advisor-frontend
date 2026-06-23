const http = require('http');

function testAnalysis(productName, price, category, description, reason) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      productName,
      price,
      category,
      description,
      reason
    });

    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve({ success: false, error: 'Parse error: ' + e.message });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: 'Request error: ' + e.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== 简单测试 ===\n');
  
  const testCase = {
    productName: 'test product',
    price: 500,
    category: '服饰鞋包',
    description: 'test desc',
    reason: 'test reason'
  };

  console.log('测试请求:', JSON.stringify(testCase));
  const result = await testAnalysis(testCase.productName, testCase.price, testCase.category, testCase.description, testCase.reason);
  
  console.log('\n响应:', JSON.stringify(result, null, 2));
}

main().catch(console.error);