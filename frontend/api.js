class ConsumerAdvisorAPI {
  constructor() {
    this.apiBaseUrl = window.location.origin;
    this.userId = 1;
  }

  async analyzePurchase(productName, price, category, description = '', reason = '') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          productName,
          price,
          category,
          description,
          reason
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('分析失败:', error);
      return { success: false, error: error.message };
    }
  }

  async getHistory(days = 30) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/history/${this.userId}?days=${days}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/stats/${this.userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return {
        totalSaved: 0,
        rejectCount: 0,
        acceptCount: 0,
        totalAnalyzed: 0,
        streak: 0
      };
    }
  }

  async getBudget() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/budget/${this.userId}`);
      const data = await response.json();
      return data;
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
      const response = await fetch(`${this.apiBaseUrl}/api/budget/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          monthlyBudget,
          categories
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('设置预算失败:', error);
      return { success: false, error: error.message };
    }
  }

  async getTactics() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/tactics`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取套路库失败:', error);
      return [];
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('健康检查失败:', error);
      return { status: 'error' };
    }
  }

  async getDiagnostic() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/diagnostic/${this.userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取诊断报告失败:', error);
      return { hasData: false, message: '获取诊断报告失败' };
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