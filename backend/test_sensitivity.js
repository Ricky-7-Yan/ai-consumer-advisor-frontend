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

async function runTests() {
  console.log('=== 价格敏感度优化测试 ===\n');
  
  const testCases = [
    {
      name: '高敏感度-食品生鲜-价格偏高',
      data: {
        productName: '进口有机牛奶',
        price: 150,
        category: '食品生鲜',
        description: '高端进口有机牛奶',
        reason: '想换更好的牛奶'
      }
    },
    {
      name: '高敏感度-图书文具-价格偏高',
      data: {
        productName: '精装珍藏版书籍',
        price: 300,
        category: '图书文具',
        description: '限量版精装书',
        reason: '收藏用'
      }
    },
    {
      name: '高敏感度-美妆护肤-价格偏高',
      data: {
        productName: '高端精华液',
        price: 1000,
        category: '美妆护肤',
        description: '大牌护肤精华',
        reason: '想改善肤质'
      }
    },
    {
      name: '低敏感度-家具家居-价格偏高',
      data: {
        productName: '实木餐桌',
        price: 3500,
        category: '家具家居',
        description: '高档实木餐桌',
        reason: '新房装修'
      }
    },
    {
      name: '低敏感度-家用电器-价格偏高',
      data: {
        productName: '高端冰箱',
        price: 8000,
        category: '家用电器',
        description: '大容量智能冰箱',
        reason: '旧冰箱坏了'
      }
    },
    {
      name: '中等敏感度-服饰鞋包-价格偏高',
      data: {
        productName: '名牌运动鞋',
        price: 1800,
        category: '服饰鞋包',
        description: '限量版运动鞋',
        reason: '喜欢这个款式'
      }
    },
    {
      name: '中等敏感度-数码产品-价格偏高',
      data: {
        productName: '高端耳机',
        price: 3500,
        category: '数码产品',
        description: '无线降噪耳机',
        reason: '提升音质体验'
      }
    }
  ];

  const results = [];
  
  for (const testCase of testCases) {
    try {
      const result = await analyzeProduct(
        testCase.data.productName,
        testCase.data.price,
        testCase.data.category,
        testCase.data.description,
        testCase.data.reason
      );

      if (result.success) {
        const analysis = result.analysis;
        results.push({
          testName: testCase.name,
          category: testCase.data.category,
          price: testCase.data.price,
          riskScore: analysis.riskScore,
          riskLevel: analysis.riskLevel,
          recommendation: analysis.recommendationText,
          priceRiskScore: analysis.dimensionAnalysis?.find(d => d.name === '价格风险')?.score || 'N/A',
          priceIndicatorScore: analysis.dimensionAnalysis?.find(d => d.name === '价格指标')?.score || 'N/A',
          sensitivity: analysis.priceIndicatorAnalysis?.sensitivity || 'N/A',
          elasticity: analysis.priceIndicatorAnalysis?.elasticity || 'N/A',
          expectedChange: analysis.priceTrendAnalysis?.expectedChange || 'N/A',
          priceChangeRisk: analysis.priceTrendAnalysis?.priceChangeRisk || 'N/A',
          bestBuyWindow: analysis.priceTrendAnalysis?.bestBuyWindow || 'N/A'
        });
      }
    } catch (error) {
      console.error(`测试失败: ${testCase.name}`, error.message);
    }
  }

  console.log('测试结果汇总:\n');
  console.log('| 品类 | 价格 | 风险评分 | 风险等级 | 价格风险维度 | 价格指标维度 | 敏感度 | 弹性 | 预期变化 | 价格变化风险 |');
  console.log('|------|------|----------|----------|------------|------------|--------|------|----------|-------------|');
  
  results.forEach(r => {
    console.log(`| ${r.category} | ¥${r.price} | ${r.riskScore} | ${r.riskLevel} | ${typeof r.priceRiskScore === 'number' ? (r.priceRiskScore * 100).toFixed(0) + '%' : r.priceRiskScore} | ${typeof r.priceIndicatorScore === 'number' ? (r.priceIndicatorScore * 100).toFixed(0) + '%' : r.priceIndicatorScore} | ${r.sensitivity} | ${r.elasticity} | ${r.expectedChange > 0 ? '+' : ''}${r.expectedChange}% | ${r.priceChangeRisk} |`);
  });

  console.log('\n=== 敏感度对比分析 ===');
  const sortedBySensitivity = [...results].sort((a, b) => b.sensitivity - a.sensitivity);
  
  console.log('\n按敏感度排序:');
  sortedBySensitivity.forEach((r, i) => {
    console.log(`${i + 1}. ${r.category} - 敏感度: ${r.sensitivity} - 风险评分: ${r.riskScore}`);
  });

  console.log('\n=== 关键发现 ===');
  const highSensitivity = sortedBySensitivity.filter(r => r.sensitivity >= 0.85);
  const lowSensitivity = sortedBySensitivity.filter(r => r.sensitivity <= 0.5);
  
  console.log(`高敏感度品类 (>=0.85): ${highSensitivity.map(r => r.category).join(', ')}`);
  console.log(`平均风险评分: ${(highSensitivity.reduce((sum, r) => sum + r.riskScore, 0) / highSensitivity.length).toFixed(1)}`);
  
  console.log(`\n低敏感度品类 (<=0.5): ${lowSensitivity.map(r => r.category).join(', ')}`);
  console.log(`平均风险评分: ${(lowSensitivity.reduce((sum, r) => sum + r.riskScore, 0) / lowSensitivity.length).toFixed(1)}`);
  
  const diff = (highSensitivity.reduce((sum, r) => sum + r.riskScore, 0) / highSensitivity.length) - 
               (lowSensitivity.reduce((sum, r) => sum + r.riskScore, 0) / lowSensitivity.length);
  console.log(`\n高敏感度品类比低敏感度品类风险评分高出: ${diff.toFixed(1)}分`);
}

runTests().catch(console.error);