class ConsumerAdvisorAPI {
  constructor() {
    this.userId = 1;
  }

  async analyzePurchase(productName, price, category, description = '', reason = '') {
    try {
      const result = window.MockAPI.generateAnalysis(productName, price, category, description, reason ? [reason] : []);
      if (result.success) {
        window.MockAPI.saveAnalysis(result.data);
      }
      return {
        success: result.success,
        recordId: Date.now(),
        analysis: result.data
      };
    } catch (error) {
      console.error('分析失败:', error);
      return { success: false, error: error.message };
    }
  }

  async getHistory(days = 30) {
    try {
      return window.MockAPI.getHistory(this.userId, days);
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const stats = window.MockAPI.getStats(this.userId);
      const recentRecords = window.MockAPI.getHistory(this.userId, 30);
      const totalSaved = recentRecords.reduce((sum, r) => sum + r.saved_amount, 0);
      const rejectCount = recentRecords.filter(r => r.decision === 'reject').length;
      const acceptCount = recentRecords.filter(r => r.decision === 'accept').length;
      
      return {
        totalSaved: totalSaved,
        rejectCount: rejectCount,
        acceptCount: acceptCount,
        totalAnalyzed: stats.totalAnalyzed,
        streak: stats.streakDays,
        badges: stats.badges,
        averageRiskScore: stats.averageRiskScore
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return {
        totalSaved: 0,
        rejectCount: 0,
        acceptCount: 0,
        totalAnalyzed: 0,
        streak: 0,
        badges: [],
        averageRiskScore: 0
      };
    }
  }

  async getBudget() {
    try {
      return window.MockAPI.getBudget(this.userId);
    } catch (error) {
      console.error('获取预算失败:', error);
      return {
        monthly_budget: 5000,
        categories: { '服饰鞋包': 1000, '数码产品': 1500, '美食餐饮': 1000, '娱乐休闲': 800, '其他': 700 }
      };
    }
  }

  async setBudget(monthlyBudget, categories) {
    try {
      return window.MockAPI.updateBudget(this.userId, {
        monthly_budget: monthlyBudget,
        categories: categories
      });
    } catch (error) {
      console.error('设置预算失败:', error);
      return { success: false, error: error.message };
    }
  }

  async getTactics() {
    try {
      return window.MockAPI.marketingTactics;
    } catch (error) {
      console.error('获取套路库失败:', error);
      return [];
    }
  }

  async healthCheck() {
    try {
      return window.MockAPI.health();
    } catch (error) {
      console.error('健康检查失败:', error);
      return { status: 'error' };
    }
  }

  async getDiagnostic() {
    try {
      const result = window.MockAPI.generateDiagnosticReport(this.userId);
      return { hasData: true, data: result.data };
    } catch (error) {
      console.error('获取诊断报告失败:', error);
      return { hasData: false, message: '获取诊断报告失败' };
    }
  }

  async getCategories() {
    try {
      return window.MockAPI.getCategories();
    } catch (error) {
      console.error('获取分类失败:', error);
      return [];
    }
  }
}

const consumerAdvisorAPI = new ConsumerAdvisorAPI();

window.consumerAdvisorAPI = consumerAdvisorAPI;

function getRiskLevelText(level) {
  const levelMap = {
    'safe': '安全',
    'low': '低风险',
    'low-medium': '中低风险',
    'medium': '中风险',
    'medium-high': '中高风险',
    'high': '高风险'
  };
  return levelMap[level] || '未知';
}

window.getRiskLevelText = getRiskLevelText;