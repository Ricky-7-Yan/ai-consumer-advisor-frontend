const http = require('http');

function analyzeProduct(productName, price, category, description, reason) {
  return new Promise((resolve, reject) => {
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
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function addSampleData() {
  console.log('=== 添加示例数据 ===\n');
  
  const testCases = [
    { productName: 'iPhone 15 Pro Max', price: 9999, category: '数码产品', description: '最新旗舰手机', reason: '想换最新款手机' },
    { productName: 'Nike Air Max运动鞋', price: 1200, category: '服饰鞋包', description: '限量版运动鞋', reason: '看到打折就心动了' },
    { productName: 'SK-II精华液', price: 1500, category: '美妆护肤', description: '大牌护肤精华', reason: '种草很久了' },
    { productName: '戴森吹风机', price: 2990, category: '家用电器', description: '高端吹风机', reason: '想改善发质' },
    { productName: '实木餐桌', price: 4500, category: '家具家居', description: '实木家具', reason: '新房装修必备' },
    { productName: '星巴克咖啡', price: 45, category: '食品生鲜', description: '每日咖啡', reason: '习惯了每天一杯' },
    { productName: 'MacBook Pro', price: 14999, category: '数码产品', description: '笔记本电脑', reason: '工作需要' },
    { productName: '轻奢包包', price: 3500, category: '服饰鞋包', description: '名牌包包', reason: '一直想要一个' },
    { productName: 'kindle电子书', price: 998, category: '图书文具', description: '电子书阅读器', reason: '喜欢看书' },
    { productName: '健身年卡', price: 3000, category: '娱乐休闲', description: '健身房会员', reason: '想减肥健身' }
  ];

  let successCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`分析: ${testCase.productName} (¥${testCase.price})`);
      const result = await analyzeProduct(
        testCase.productName,
        testCase.price,
        testCase.category,
        testCase.description,
        testCase.reason
      );

      if (result.success) {
        const analysis = result.analysis;
        console.log(`  ✓ 风险评分: ${analysis.riskScore}/10 (${analysis.riskLevel})`);
        console.log(`  ✓ 建议: ${analysis.recommendationText}`);
        successCount++;
      } else {
        console.log(`  ✗ 失败: ${result.error}`);
        failCount++;
      }
    } catch (error) {
      console.log(`  ✗ 错误: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n=== 完成 ===`);
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${failCount} 条`);
  console.log(`\n现在您可以在诊断报告中查看汇总数据了！`);
}

addSampleData().catch(console.error);