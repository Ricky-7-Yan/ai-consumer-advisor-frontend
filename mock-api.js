// Mock API - 纯前端消费分析服务
// 使用localStorage存储数据，模拟后端API

const MockAPI = {
  database: {
    users: [
      { id: 1, username: '理性消费者', email: 'user@consumer.com', created_at: new Date().toISOString() }
    ],
    analysis_records: [],
    budget_settings: []
  },

  marketingTactics: [
    '限时抢购', '限量发售', '饥饿营销', '满减陷阱', '捆绑套餐', 
    '直播带货', '低价诱饵', '免费试用', '会员专属', '新品首发',
    '社交证明', '稀缺性营销', '权威背书', '情感营销', '紧迫感营造'
  ],

  impulseKeywords: [
    '限时', '限量', '最后', '仅剩', '抢购', '秒杀', '特价', 
    '超值', '必买', '神价', '错过', '绝版', '珍藏', '尊享',
    '爆款', '热卖', '疯抢', '手慢', '仅此', '难得', '千载难逢'
  ],

  impulseIndicators: [
    '突然想买', '没有计划', '限时优惠', '朋友推荐', '主播推荐',
    '刷到就想买', '价格很低', '看起来很好', '别人都在买', '限量款',
    '新品发布', '心情不好', '犒劳自己', '奖励自己', '弥补遗憾'
  ],

  psychologyFactors: [
    '羊群效应', '损失厌恶', '锚定效应', '稀缺性原理', '互惠原则',
    '社会认同', '权威效应', '喜好偏见', '承诺一致', '即时满足'
  ],

  priceIndicatorData: {
    '数码产品': { priceElasticity: 0.8, sensitivityAdjustment: 1.5, baseThreshold: 500 },
    '服饰鞋包': { priceElasticity: 1.2, sensitivityAdjustment: 2.0, baseThreshold: 300 },
    '美妆护肤': { priceElasticity: 1.0, sensitivityAdjustment: 1.8, baseThreshold: 200 },
    '食品生鲜': { priceElasticity: 0.5, sensitivityAdjustment: 1.0, baseThreshold: 100 },
    '家用电器': { priceElasticity: 0.6, sensitivityAdjustment: 1.2, baseThreshold: 800 },
    '图书音像': { priceElasticity: 1.5, sensitivityAdjustment: 2.5, baseThreshold: 50 },
    '家具家居': { priceElasticity: 0.4, sensitivityAdjustment: 1.0, baseThreshold: 1000 },
    '运动户外': { priceElasticity: 0.9, sensitivityAdjustment: 1.6, baseThreshold: 400 },
    '母婴用品': { priceElasticity: 0.7, sensitivityAdjustment: 1.3, baseThreshold: 300 },
    '宠物用品': { priceElasticity: 0.8, sensitivityAdjustment: 1.4, baseThreshold: 200 },
    'default': { priceElasticity: 1.0, sensitivityAdjustment: 1.0, baseThreshold: 500 }
  },

  necessityKeywords: {
    '高': ['必需', '必备', '刚需', '不可缺少', '生活必需', '日常用品', '必需品'],
    '中': ['需要', '有用', '实用', '方便', '提高效率', '改善生活'],
    '低': ['可有可无', '装饰', '收藏', '炫耀', '打发时间', '玩具', '奢侈品']
  },

  industryData: {
    '数码产品': { marketSize: '大', growthRate: '高', seasonality: '强', competition: '激烈' },
    '服饰鞋包': { marketSize: '大', growthRate: '中', seasonality: '强', competition: '激烈' },
    '美妆护肤': { marketSize: '大', growthRate: '高', seasonality: '中', competition: '激烈' },
    '食品生鲜': { marketSize: '大', growthRate: '中', seasonality: '中', competition: '中等' },
    '家用电器': { marketSize: '中', growthRate: '中', seasonality: '中', competition: '中等' },
    '图书音像': { marketSize: '小', growthRate: '低', seasonality: '弱', competition: '中等' },
    '家具家居': { marketSize: '中', growthRate: '中', seasonality: '中', competition: '中等' },
    '运动户外': { marketSize: '中', growthRate: '高', seasonality: '强', competition: '中等' },
    '母婴用品': { marketSize: '中', growthRate: '中', seasonality: '弱', competition: '中等' },
    '宠物用品': { marketSize: '中', growthRate: '高', seasonality: '弱', competition: '中等' },
    'default': { marketSize: '中', growthRate: '中', seasonality: '中', competition: '中等' }
  },

  competitorData: {
    '数码产品': { avgPrice: 1500, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '1000-3000' },
    '服饰鞋包': { avgPrice: 500, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '200-1500' },
    '美妆护肤': { avgPrice: 300, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '100-800' },
    '食品生鲜': { avgPrice: 100, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '50-300' },
    '家用电器': { avgPrice: 1000, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '500-3000' },
    '图书音像': { avgPrice: 50, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '20-100' },
    '家具家居': { avgPrice: 1500, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '500-5000' },
    '运动户外': { avgPrice: 500, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '200-1500' },
    '母婴用品': { avgPrice: 400, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '100-1000' },
    '宠物用品': { avgPrice: 200, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '50-500' },
    'default': { avgPrice: 500, alternatives: ['品牌A', '品牌B', '品牌C'], priceRange: '100-1000' }
  },

  categories: ['数码产品', '服饰鞋包', '美妆护肤', '食品生鲜', '家用电器', 
               '图书音像', '家具家居', '运动户外', '母婴用品', '宠物用品'],

  loadData() {
    const saved = localStorage.getItem('consumerAdvisorDB');
    if (saved) {
      this.database = JSON.parse(saved);
    } else {
      this.database.analysis_records = [
        { id: 1, user_id: 1, product_name: '限量版球鞋', price: 1999, category: '服饰鞋包', decision: 'reject', risk_level: 'high', detected_tactics: ['限时抢购', '稀缺性营销'], saved_amount: 1999, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, user_id: 1, product_name: '家用咖啡机', price: 899, category: '家用电器', decision: 'accept', risk_level: 'low', detected_tactics: [], saved_amount: 0, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, user_id: 1, product_name: '直播带货护肤品套装', price: 599, category: '美妆护肤', decision: 'reject', risk_level: 'medium', detected_tactics: ['直播营销', '捆绑销售'], saved_amount: 599, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, user_id: 1, product_name: '电子阅读器', price: 1298, category: '数码产品', decision: 'accept', risk_level: 'low', detected_tactics: [], saved_amount: 0, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, user_id: 1, product_name: '618满减零食大礼包', price: 299, category: '食品生鲜', decision: 'reject', risk_level: 'medium', detected_tactics: ['满减陷阱', '捆绑套餐'], saved_amount: 299, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 6, user_id: 1, product_name: '智能手环', price: 399, category: '数码产品', decision: 'reject', risk_level: 'high', detected_tactics: ['饥饿营销', '限时秒杀'], saved_amount: 399, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 7, user_id: 1, product_name: '办公椅', price: 699, category: '家具家居', decision: 'accept', risk_level: 'low', detected_tactics: [], saved_amount: 0, created_at: new Date().toISOString() }
      ];
      this.database.budget_settings = [
        { id: 1, user_id: 1, monthly_budget: 5000, categories: { '服饰鞋包': 1000, '数码产品': 1500, '美食餐饮': 1000, '娱乐休闲': 800, '其他': 700 }, created_at: new Date().toISOString() }
      ];
      this.saveData();
    }
  },

  saveData() {
    localStorage.setItem('consumerAdvisorDB', JSON.stringify(this.database));
  },

  getPriceThreshold(category) {
    const indicator = this.priceIndicatorData[category] || this.priceIndicatorData['default'];
    return indicator.baseThreshold * indicator.sensitivityAdjustment;
  },

  analyzePriceIndicator(productName, price, category) {
    const indicator = this.priceIndicatorData[category] || this.priceIndicatorData['default'];
    const threshold = this.getPriceThreshold(category);
    
    let priceDeviation = 0;
    const avgPrice = this.competitorData[category]?.avgPrice || 500;
    if (avgPrice > 0) {
      priceDeviation = (price - avgPrice) / avgPrice;
    }

    const priceTier = price < 100 ? 'low' : price < 500 ? 'medium' : 'high';
    
    const priceChangeRate = this.calculatePriceChangeRate(category, price);
    const seasonalFactor = this.getSeasonalFactor(category);
    const promotionImpact = this.calculatePromotionImpact(productName);
    
    return {
      priceDeviation: priceDeviation,
      priceTier: priceTier,
      isHighPrice: price > threshold,
      priceElasticity: indicator.priceElasticity,
      sensitivityLevel: indicator.sensitivityAdjustment > 1.5 ? 'high' : indicator.sensitivityAdjustment > 1.2 ? 'medium' : 'low',
      priceChangeRisk: this.calculatePriceChangeRisk(priceChangeRate, seasonalFactor, promotionImpact),
      threshold: threshold,
      avgMarketPrice: avgPrice,
      priceChangeRate: priceChangeRate,
      seasonalImpact: seasonalFactor,
      promotionImpact: promotionImpact
    };
  },

  calculatePriceChangeRate(category, currentPrice) {
    const historicalPrices = [
      currentPrice * 0.9,
      currentPrice * 0.95,
      currentPrice * 1.05,
      currentPrice * 1.1
    ];
    const avgHistorical = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
    return (currentPrice - avgHistorical) / avgHistorical;
  },

  getSeasonalFactor(category) {
    const month = new Date().getMonth() + 1;
    const seasonalCategories = {
      '服饰鞋包': month >= 3 && month <= 5 ? 0.3 : month >= 6 && month <= 8 ? 0.3 : month >= 9 && month <= 11 ? 0.2 : 0.2,
      '美妆护肤': month >= 4 && month <= 6 ? 0.25 : 0.15,
      '食品生鲜': 0.1,
      '数码产品': month >= 11 && month <= 12 ? 0.3 : 0.15,
      '运动户外': month >= 5 && month <= 8 ? 0.25 : 0.1
    };
    return seasonalCategories[category] || 0.1;
  },

  calculatePromotionImpact(productName) {
    const promotionKeywords = ['限时', '秒杀', '抢购', '折扣', '优惠', '满减', '活动', '促销'];
    let impact = 0;
    promotionKeywords.forEach(keyword => {
      if (productName.includes(keyword)) {
        impact += 0.15;
      }
    });
    return Math.min(impact, 0.5);
  },

  calculatePriceChangeRisk(changeRate, seasonalFactor, promotionImpact) {
    let risk = Math.abs(changeRate) * 10;
    risk += seasonalFactor * 5;
    risk += promotionImpact * 15;
    return Math.min(risk, 30);
  },

  analyzeIndustry(category) {
    return this.industryData[category] || this.industryData['default'];
  },

  analyzeCompetitors(productName, price, category) {
    const data = this.competitorData[category] || this.competitorData['default'];
    const priceComparison = price > data.avgPrice ? '高于平均' : price < data.avgPrice * 0.8 ? '低于平均' : '接近平均';
    const priceGap = ((price - data.avgPrice) / data.avgPrice * 100).toFixed(1);
    
    return {
      avgMarketPrice: data.avgPrice,
      priceRange: data.priceRange,
      alternatives: data.alternatives,
      priceComparison: priceComparison,
      priceGapPercent: priceGap,
      recommendation: priceComparison === '高于平均' ? '建议比价' : '价格合理'
    };
  },

  analyzeMarketingTactics(productName) {
    const detected = [];
    this.marketingTactics.forEach(tactic => {
      if (productName.includes(tactic)) {
        detected.push(tactic);
      }
    });
    return detected;
  },

  analyzeImpulseIndicators(productName, description) {
    const indicators = [];
    const fullText = (productName + ' ' + (description || '')).toLowerCase();
    
    this.impulseKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) {
        indicators.push(keyword);
      }
    });
    return indicators;
  },

  analyzePsychology(productName) {
    const factors = [];
    const triggers = {
      '羊群效应': ['大家都在买', '爆款', '热销', '疯抢'],
      '损失厌恶': ['错过', '不再有', '最后'],
      '锚定效应': ['原价', '现价', '直降'],
      '稀缺性原理': ['限量', '绝版', '仅剩'],
      '互惠原则': ['免费', '赠送', '礼包'],
      '社会认同': ['明星同款', '网红推荐', '达人推荐'],
      '权威效应': ['专家推荐', '认证', '正品'],
      '即时满足': ['立即', '马上', '即刻']
    };

    Object.keys(triggers).forEach(factor => {
      triggers[factor].forEach(trigger => {
        if (productName.includes(trigger)) {
          factors.push(factor);
        }
      });
    });
    return factors;
  },

  analyzeNecessity(productName) {
    let level = '中';
    let score = 50;
    
    this.necessityKeywords['高'].forEach(keyword => {
      if (productName.includes(keyword)) {
        level = '高';
        score += 20;
      }
    });
    
    this.necessityKeywords['低'].forEach(keyword => {
      if (productName.includes(keyword)) {
        level = '低';
        score -= 20;
      }
    });
    
    return {
      level: level,
      score: Math.max(10, Math.min(90, score))
    };
  },

  calculateRiskScore(productName, price, category, description, impulseIndicators) {
    let score = 0;
    
    const tactics = this.analyzeMarketingTactics(productName);
    score += tactics.length * 8;
    
    const impulse = this.analyzeImpulseIndicators(productName, description);
    score += impulse.length * 6;
    
    const psychology = this.analyzePsychology(productName);
    score += psychology.length * 5;
    
    const priceIndicator = this.analyzePriceIndicator(productName, price, category);
    const sensitivityWeight = priceIndicator.sensitivityAdjustment;
    score += Math.min(priceIndicator.priceChangeRisk * sensitivityWeight, 25);
    
    const necessity = this.analyzeNecessity(productName);
    score += (100 - necessity.score) * 0.2;
    
    if (impulseIndicators && impulseIndicators.length > 0) {
      score += impulseIndicators.length * 5;
    }
    
    return Math.min(Math.round(score), 100);
  },

  getRiskLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  },

  generateAnalysis(productName, price, category, description, impulseIndicators) {
    const riskScore = this.calculateRiskScore(productName, price, category, description, impulseIndicators);
    const riskLevel = this.getRiskLevel(riskScore);
    const tactics = this.analyzeMarketingTactics(productName);
    const impulse = this.analyzeImpulseIndicators(productName, description);
    const psychology = this.analyzePsychology(productName);
    const necessity = this.analyzeNecessity(productName);
    const priceIndicator = this.analyzePriceIndicator(productName, price, category);
    const industry = this.analyzeIndustry(category);
    const competitors = this.analyzeCompetitors(productName, price, category);
    
    let decision = 'accept';
    let savedAmount = 0;
    
    if (riskLevel === 'high') {
      decision = 'reject';
      savedAmount = price;
    } else if (riskLevel === 'medium') {
      decision = 'reject';
      savedAmount = price;
    }
    
    return {
      success: true,
      data: {
        productName: productName,
        price: price,
        category: category,
        riskScore: riskScore,
        riskLevel: riskLevel,
        decision: decision,
        savedAmount: savedAmount,
        detectedTactics: tactics,
        impulseIndicators: impulse,
        psychologyFactors: psychology,
        necessityLevel: necessity.level,
        necessityScore: necessity.score,
        priceIndicator: priceIndicator,
        industryAnalysis: industry,
        competitorAnalysis: competitors,
        timestamp: new Date().toISOString(),
        recommendation: this.generateRecommendation(riskLevel, tactics, priceIndicator, necessity)
      }
    };
  },

  generateRecommendation(riskLevel, tactics, priceIndicator, necessity) {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push('强烈建议不要购买，风险极高');
    } else if (riskLevel === 'medium') {
      recommendations.push('建议谨慎购买，存在一定风险');
    } else {
      recommendations.push('风险较低，可以考虑购买');
    }
    
    if (tactics.length > 0) {
      recommendations.push(`检测到${tactics.length}种营销套路，请注意识别`);
    }
    
    if (priceIndicator.isHighPrice) {
      recommendations.push('价格高于阈值，建议货比三家');
    }
    
    if (priceIndicator.priceChangeRisk > 20) {
      recommendations.push('近期价格波动较大，建议观望');
    }
    
    if (necessity.level === '低') {
      recommendations.push('非必需品，建议延迟购买决策');
    }
    
    return recommendations;
  },

  generatePriceTrendRecommendation(productName, price, category) {
    const priceIndicator = this.analyzePriceIndicator(productName, price, category);
    const recommendations = [];
    
    if (priceIndicator.priceChangeRate > 0.1) {
      recommendations.push('价格近期上涨，不建议立即购买');
      recommendations.push('建议等待促销活动或价格回落');
    } else if (priceIndicator.priceChangeRate < -0.1) {
      recommendations.push('价格近期下降，是购买的好时机');
    }
    
    if (priceIndicator.seasonalImpact > 0.2) {
      recommendations.push('当前处于销售旺季，价格可能偏高');
      recommendations.push('建议在淡季购买以获得更好价格');
    }
    
    if (priceIndicator.promotionImpact > 0.3) {
      recommendations.push('检测到促销活动，注意甄别真伪折扣');
      recommendations.push('建议对比历史价格确认是否真正优惠');
    }
    
    const bestWindow = this.determineBestBuyWindow(category);
    recommendations.push(`预计最佳购买时机：${bestWindow}`);
    
    return recommendations;
  },

  determineBestBuyWindow(category) {
    const month = new Date().getMonth() + 1;
    const windows = {
      '数码产品': month >= 11 ? '双11/双12期间' : month >= 6 ? '618期间' : '下一个大促期间',
      '服饰鞋包': month >= 12 ? '年终清仓' : month >= 6 ? '年中大促' : '换季打折期间',
      '美妆护肤': '618或双11期间',
      '家用电器': '618或双11期间',
      '食品生鲜': '日常购买即可',
      '图书音像': '世界读书日或大促期间'
    };
    return windows[category] || '日常关注价格波动';
  },

  saveAnalysis(record) {
    const newRecord = {
      id: Date.now(),
      user_id: 1,
      product_name: record.productName,
      price: record.price,
      category: record.category,
      decision: record.decision,
      risk_level: record.riskLevel,
      detected_tactics: record.detectedTactics,
      saved_amount: record.savedAmount,
      created_at: new Date().toISOString()
    };
    this.database.analysis_records.unshift(newRecord);
    this.saveData();
    return newRecord;
  },

  getHistory(userId = 1, limit = 10) {
    return this.database.analysis_records
      .filter(r => r.user_id === userId)
      .slice(0, limit);
  },

  getStats(userId = 1) {
    const records = this.database.analysis_records.filter(r => r.user_id === userId);
    const rejected = records.filter(r => r.decision === 'reject');
    const accepted = records.filter(r => r.decision === 'accept');
    const savedAmount = rejected.reduce((sum, r) => sum + r.saved_amount, 0);
    
    return {
      totalAnalyzed: records.length,
      totalRejected: rejected.length,
      totalAccepted: accepted.length,
      totalSaved: savedAmount,
      averageRiskScore: records.length > 0 ? Math.round(records.reduce((sum, r) => {
        const map = { high: 75, medium: 50, low: 25 };
        return sum + (map[r.risk_level] || 50);
      }, 0) / records.length) : 0,
      streakDays: 7,
      badges: ['初露锋芒', '百元守护', '五百卫士', '千金一诺', '三天理性', '一周自律']
    };
  },

  getBudget(userId = 1) {
    const budget = this.database.budget_settings.find(b => b.user_id === userId);
    if (budget) return budget;
    return {
      id: 1,
      user_id: userId,
      monthly_budget: 5000,
      categories: { '服饰鞋包': 1000, '数码产品': 1500, '美食餐饮': 1000, '娱乐休闲': 800, '其他': 700 },
      created_at: new Date().toISOString()
    };
  },

  updateBudget(userId, budgetData) {
    const existing = this.database.budget_settings.find(b => b.user_id === userId);
    if (existing) {
      existing.monthly_budget = budgetData.monthly_budget;
      existing.categories = budgetData.categories;
    } else {
      this.database.budget_settings.push({
        id: Date.now(),
        user_id: userId,
        ...budgetData,
        created_at: new Date().toISOString()
      });
    }
    this.saveData();
    return { success: true };
  },

  generateDiagnosticReport(userId = 1) {
    const records = this.database.analysis_records.filter(r => r.user_id === userId);
    const stats = this.getStats(userId);
    
    if (records.length === 0) {
      return {
        success: true,
        data: {
          rationalityScore: 0,
          stats: stats,
          riskDistribution: { high: 0, medium: 0, low: 0 },
          commonTactics: [],
          issues: ['暂无消费记录，请先进行消费分析'],
          suggestions: ['开始使用消费分析功能'],
          personalRules: []
        }
      };
    }
    
    const highRiskCount = records.filter(r => r.risk_level === 'high').length;
    const mediumRiskCount = records.filter(r => r.risk_level === 'medium').length;
    const lowRiskCount = records.filter(r => r.risk_level === 'low').length;
    
    const tacticFrequency = {};
    records.forEach(r => {
      r.detected_tactics.forEach(t => {
        tacticFrequency[t] = (tacticFrequency[t] || 0) + 1;
      });
    });
    const commonTactics = Object.entries(tacticFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => ({ tactic: e[0], count: e[1] }));
    
    const issues = [];
    const suggestions = [];
    
    if (highRiskCount > mediumRiskCount + lowRiskCount) {
      issues.push('冲动消费倾向较高');
      suggestions.push('建议设置24小时冷静期');
    }
    
    if (stats.totalRejected < stats.totalAccepted * 0.5) {
      issues.push('拒绝率偏低');
      suggestions.push('建议提高消费警惕性');
    }
    
    if (commonTactics.length > 0) {
      issues.push(`容易受${commonTactics[0].tactic}影响`);
      suggestions.push('识别并避免常见营销套路');
    }
    
    const personalRules = [
      '购买前思考30分钟',
      '超过500元的商品货比三家',
      '非必需品延迟24小时购买',
      '设置月度消费预算',
      '记录每笔消费决策'
    ];
    
    const rationalityScore = Math.min(100, Math.round(
      (stats.totalRejected / (stats.totalAccepted + stats.totalRejected + 1)) * 60 +
      (stats.streakDays / 30) * 40
    ));
    
    return {
      success: true,
      data: {
        rationalityScore: rationalityScore,
        stats: stats,
        riskDistribution: {
          high: highRiskCount,
          medium: mediumRiskCount,
          low: lowRiskCount
        },
        commonTactics: commonTactics,
        issues: issues,
        suggestions: suggestions,
        personalRules: personalRules,
        generatedAt: new Date().toISOString()
      }
    };
  },

  getCategories() {
    return this.categories;
  },

  health() {
    return { status: 'ok', version: '1.0.0' };
  }
};

MockAPI.loadData();

// 导出给全局使用
window.MockAPI = MockAPI;