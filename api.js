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

      const riskDistribution = {
        high: recentRecords.filter(r => r.risk_level === 'high').length,
        medium: recentRecords.filter(r => r.risk_level === 'medium').length,
        low: recentRecords.filter(r => r.risk_level === 'low').length
      };

      const categoryStats = {};
      recentRecords.forEach(r => {
        if (!categoryStats[r.category]) {
          categoryStats[r.category] = { saved: 0, total: 0, accepted: 0, rejected: 0 };
        }
        categoryStats[r.category].saved += r.saved_amount;
        categoryStats[r.category].total += 1;
        if (r.decision === 'accept') {
          categoryStats[r.category].accepted += 1;
        } else {
          categoryStats[r.category].rejected += 1;
        }
      });

      const tacticStats = {};
      recentRecords.forEach(r => {
        if (r.detected_tactics) {
          r.detected_tactics.forEach(tactic => {
            tacticStats[tactic] = (tacticStats[tactic] || 0) + 1;
          });
        }
      });

      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = days[d.getDay()];
        const count = recentRecords.filter(r => {
          const recordDate = new Date(r.created_at);
          return recordDate.getDate() === d.getDate() && 
                 recordDate.getMonth() === d.getMonth();
        }).length;
        weeklyTrend.push({ day: dayStr, analyzed: count });
      }
      
      return {
        totalSaved: totalSaved,
        rejectCount: rejectCount,
        acceptCount: acceptCount,
        totalAnalyzed: stats.totalAnalyzed,
        streak: stats.streakDays,
        badges: stats.badges,
        averageRiskScore: stats.averageRiskScore,
        weeklyTrend: weeklyTrend,
        riskDistribution: riskDistribution,
        categoryStats: categoryStats,
        tacticStats: tacticStats
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        weeklyTrend.push({ day: days[d.getDay()], analyzed: 0 });
      }
      return {
        totalSaved: 0,
        rejectCount: 0,
        acceptCount: 0,
        totalAnalyzed: 0,
        streak: 0,
        badges: [],
        averageRiskScore: 0,
        weeklyTrend: weeklyTrend,
        riskDistribution: { high: 0, medium: 0, low: 0 },
        categoryStats: {}
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