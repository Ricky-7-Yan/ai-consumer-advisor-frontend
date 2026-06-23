const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'app.html'));
});

app.get('/app/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'app.html'));
});

const database = {
  users: [
    { id: 1, username: '理性消费者', email: 'user@consumer.com', created_at: new Date().toISOString() }
  ],
  analysis_records: [
    { id: 1, user_id: 1, product_name: '限量版球鞋', price: 1999, category: '服饰鞋包', decision: 'reject', risk_level: 'high', detected_tactics: ['限时抢购', '稀缺性营销'], saved_amount: 1999, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, user_id: 1, product_name: '家用咖啡机', price: 899, category: '家用电器', decision: 'accept', risk_level: 'low', detected_tactics: [], saved_amount: 0, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 3, user_id: 1, product_name: '直播带货护肤品套装', price: 599, category: '美妆护肤', decision: 'reject', risk_level: 'medium', detected_tactics: ['直播营销', '捆绑销售'], saved_amount: 599, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 4, user_id: 1, product_name: '电子阅读器', price: 1298, category: '数码产品', decision: 'accept', risk_level: 'low', detected_tactics: [], saved_amount: 0, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 5, user_id: 1, product_name: '618满减零食大礼包', price: 299, category: '食品生鲜', decision: 'reject', risk_level: 'medium', detected_tactics: ['满减陷阱', '捆绑套餐'], saved_amount: 299, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 6, user_id: 1, product_name: '智能手环', price: 399, category: '数码产品', decision: 'reject', risk_level: 'high', detected_tactics: ['饥饿营销', '限时秒杀'], saved_amount: 399, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 7, user_id: 1, product_name: '办公椅', price: 699, category: '家具家居', decision: 'accept', risk_level: 'low', detected_tactics: [], saved_amount: 0, created_at: new Date().toISOString() }
  ],
  budget_settings: [
    { id: 1, user_id: 1, monthly_budget: 5000, categories: { '服饰鞋包': 1000, '数码产品': 1500, '美食餐饮': 1000, '娱乐休闲': 800, '其他': 700 }, created_at: new Date().toISOString() }
  ]
};

let nextUserId = 2;
let nextRecordId = 8;
let nextBudgetId = 2;

const marketingTactics = [
  { keyword: ['限时', '倒计时', '最后', '仅剩', '即将结束', '限时特惠', '限时折扣', '限时抢购', '限时秒杀', '限时特价'], name: '限时抢购', risk: 'high', description: '制造紧迫感，迫使快速决策', category: 'urgency' },
  { keyword: ['限量', '绝版', '独家', '稀缺', '限量版', '限定款', '珍藏', '限量发售', '限量供应', '限量抢购'], name: '稀缺性营销', risk: 'high', description: '利用物以稀为贵心理刺激购买', category: 'scarcity' },
  { keyword: ['秒杀', '闪购', '特价', '超低价', '跳楼价', '亏本价', '秒杀价', '闪购价', '特价专区', '秒杀专区'], name: '限时秒杀', risk: 'high', description: '极低价格制造冲动', category: 'price_pressure' },
  { keyword: ['直播', '主播推荐', '网红同款', '直播间', '直播专享', '直播特价', '主播带货', '网红推荐', '直播限时', '直播间专属'], name: '直播营销', risk: 'medium', description: '实时互动和氛围营造', category: 'social_influence' },
  { keyword: ['满减', '满赠', '凑单', '满XX减', '跨店满减', '满减活动', '满额减免', '满额送礼', '凑单神器', '凑单专区'], name: '满减陷阱', risk: 'medium', description: '为凑优惠购买不必要商品', category: 'bundle_trap' },
  { keyword: ['套餐', '组合', '套装', '大礼包', '全家桶', '超值组合', '套装优惠', '组合套餐', '礼盒套装', '组合特价'], name: '捆绑销售', risk: 'medium', description: '强制捆绑不想要的商品', category: 'bundle_trap' },
  { keyword: ['预售', '定金', '付定', '尾款', '定金膨胀', '预付', '预售专享', '定金翻倍', '预售优惠', '定金抵扣'], name: '预售套路', risk: 'medium', description: '定金膨胀诱惑，退款困难', category: 'commitment_trap' },
  { keyword: ['爆款', '必买', '断货', '热销', '疯抢', '抢购', '爆款推荐', '必买清单', '热销榜单', '爆款专区'], name: '饥饿营销', risk: 'high', description: '刻意制造供应紧张', category: 'scarcity' },
  { keyword: ['原价', '折扣', '直降', '降价', '优惠价', '活动价', '立减', '原价对比', '折扣力度', '降价幅度'], name: '价格锚定', risk: 'low', description: '用原价对比制造低价错觉', category: 'price_anchor' },
  { keyword: ['新品', '首发', '上市', '全新', '升级款', '新品首发', '新品上市', '全新升级', '首发优惠', '新品专享'], name: '新品营销', risk: 'low', description: '利用新鲜感刺激购买', category: 'novelty' },
  { keyword: ['免费', '赠品', '送', '附赠', '加赠', '买一送一', '免费赠送', '赠品专区', '买赠活动', '赠送礼品'], name: '赠品营销', risk: 'medium', description: '利用赠品增加购买欲望', category: 'freebie_trap' },
  { keyword: ['包邮', '免运费', '运费险', '无忧退换', '包邮专区', '免运费活动', '运费险赠送', '无忧退货'], name: '降低顾虑营销', risk: 'low', description: '降低购买决策顾虑', category: 'risk_reduction' },
  { keyword: ['会员价', '专属价', 'VIP价', '尊享价', '会员专享', 'VIP专属', '会员折扣', '专属优惠'], name: '会员专属', risk: 'low', description: '利用会员身份刺激购买', category: 'membership' },
  { keyword: ['评价', '好评', '晒单', '追评', '买家秀', '好评如潮', '晒单有礼', '评价奖励', '好评返现'], name: '评价营销', risk: 'low', description: '利用用户评价影响决策', category: 'social_proof' },
  { keyword: ['官方正品', '授权', '防伪', '正品保障', '官方授权', '正品专柜', '防伪验证', '正品保证'], name: '信任背书', risk: 'low', description: '建立信任感', category: 'trust_building' },
  { keyword: ['明星同款', '网红推荐', '达人推荐', '博主推荐', '明星代言', '网红爆款', '达人种草', '博主同款'], name: '明星网红效应', risk: 'medium', description: '利用名人效应影响决策', category: 'social_influence' },
  { keyword: ['节日特惠', '活动特价', '促销活动', '节日促销', '活动专区', '节日优惠', '促销专享'], name: '节日促销', risk: 'medium', description: '利用节日氛围刺激消费', category: 'occasion_driven' },
  { keyword: ['返现', '返利', '返券', '返积分', '返现活动', '返利专区', '返券优惠', '积分返还'], name: '返现诱惑', risk: 'medium', description: '利用返现机制刺激购买', category: 'cashback_trap' },
  { keyword: ['优惠券', '折扣券', '代金券', '券后价', '用券优惠', '优惠券专区', '折扣券活动'], name: '优惠券陷阱', risk: 'low', description: '利用优惠券制造优惠错觉', category: 'coupon_trap' },
  { keyword: ['分期', '免息', '分期付款', '0利息', '分期优惠', '免息分期', '分期免息'], name: '分期诱惑', risk: 'medium', description: '降低支付门槛刺激消费', category: 'payment_trap' }
];

const impulseIndicators = [
  { keyword: ['想要', '种草', '好看', '喜欢', '爱了', '心动', '太好看', '超喜欢', '太想要', '好想要', '必须买', '一定要', '好心动', '超心动'], type: 'emotional', weight: 1.5, description: '情感驱动型冲动' },
  { keyword: ['现在', '立刻', '马上', '赶紧', '马上抢', '立即购买', '现在就买', '立刻下单', '马上抢购', '赶紧买', '快抢', '快买', '限时', '抢购'], type: 'urgency', weight: 2.5, description: '紧迫感驱动型冲动' },
  { keyword: ['便宜', '划算', '超值', '性价比', '太值了', '白菜价', '很便宜', '特别划算', '超划算', '性价比高', '太便宜了', '好便宜', '巨便宜'], type: 'price_sensitive', weight: 1.2, description: '价格敏感型冲动' },
  { keyword: ['别人都买', '大家都在用', '人手一个', '必备', '网红', '明星同款', '都在买', '人手必备', '大家都有', '流行', '好多人都在买', '都在用', '都在抢', '人手一件', '人手一台', '很火', '爆款', '热门', '潮流', 'out'], type: 'social_proof', weight: 1.8, description: '社会认同型冲动' },
  { keyword: ['最后一件', '只剩', '即将售罄', '库存紧张', '仅剩X件', '最后机会', '库存告急', '即将断货', '只剩几件', '限量', '限时', '仅剩', '库存不足', '断货', '售罄', '名额有限', '名额紧张'], type: 'scarcity', weight: 2.2, description: '稀缺感驱动型冲动' },
  { keyword: ['错过', '不再有', '难得', '仅此一次', '错过等一年', '错过后悔', '难得机会', '仅此一次机会', '错过可惜', '可惜', '后悔', '懊恼'], type: 'fear_of_missing', weight: 2.3, description: '错失恐惧型冲动' },
  { keyword: ['犒劳', '奖励', '放纵一下', '对自己好点', '犒劳自己', '奖励自己', '犒劳一下', '对自己好一点', '该对自己好点', '宠爱自己', '善待自己', '对自己好一点'], type: 'self_indulgence', weight: 1.6, description: '自我奖励型冲动' },
  { keyword: ['心情不好', '压力大', '难过', '不开心', '郁闷', '烦躁', '心情差', '压力大想买', '不开心想买', '情绪低落', '心情不好想买', '沮丧'], type: 'emotional_shopping', weight: 2.8, description: '情绪宣泄型冲动' },
  { keyword: ['换季', '换新', '新年', '节日', '礼物', '换季买', '换新装备', '节日礼物', '新年买', '过节买', '送礼', '送人', '生日礼物'], type: 'occasion_driven', weight: 1.3, description: '场景驱动型冲动' },
  { keyword: ['刚好', '正好', '需要', '缺', '没了', '刚好需要', '正好缺', '刚好没', '正好需要', '刚好想买', '正好需要', '正好想买'], type: 'need_creation', weight: 1.1, description: '需求创造型冲动' },
  { keyword: ['冲动', '一时冲动', '心血来潮', '突然想买', '一时兴起', '冲动消费', '心血来潮买', '突然想要', '脑子一热', '鬼使神差'], type: 'impulse_aware', weight: 3.0, description: '自我认知型冲动' },
  { keyword: ['无聊', '打发时间', '消遣', '随便看看', '无聊想买', '打发时间买', '消遣购物', '随便逛逛', '闲逛', '逛逛', '刷到', '刷到的'], type: 'boredom', weight: 2.0, description: '无聊驱动型冲动' },
  { keyword: ['主播推荐', '博主推荐', '种草', '拔草', '测评', '安利', '推荐', '网红款', '网红推荐', '达人推荐'], type: 'influencer', weight: 2.0, description: '网红效应型冲动' }
];

// 消费场景识别
const consumptionScenarios = [
  { keywords: ['办公', '工作', '商务', '会议', '职场', '办公室', '办公用品', '商务用品'], scenario: 'work', description: '工作场景', necessityLevel: 'high' },
  { keywords: ['学习', '考试', '读书', '考研', '培训', '课程', '学习用品', '考试用品'], scenario: 'education', description: '学习场景', necessityLevel: 'high' },
  { keywords: ['健身', '运动', '减肥', '锻炼', '跑步', '健身房', '运动装备', '健身用品'], scenario: 'health', description: '健康场景', necessityLevel: 'medium' },
  { keywords: ['旅行', '旅游', '出差', '度假', '出行', '旅行用品', '旅游装备'], scenario: 'travel', description: '旅行场景', necessityLevel: 'medium' },
  { keywords: ['居家', '生活', '日常', '家用', '生活用品', '居家用品', '日用品'], scenario: 'daily_life', description: '日常生活场景', necessityLevel: 'high' },
  { keywords: ['娱乐', '游戏', '休闲', '玩乐', '娱乐用品', '游戏装备', '休闲用品'], scenario: 'entertainment', description: '娱乐场景', necessityLevel: 'low' },
  { keywords: ['社交', '聚会', '约会', '送礼', '礼物', '社交用品', '聚会用品'], scenario: 'social', description: '社交场景', necessityLevel: 'medium' },
  { keywords: ['护肤', '美容', '化妆', '保养', '美妆', '护肤品', '化妆品'], scenario: 'beauty', description: '美容场景', necessityLevel: 'medium' },
  { keywords: ['美食', '餐饮', '零食', '食品', '饮料', '美食用品', '餐饮用品'], scenario: 'food', description: '美食场景', necessityLevel: 'medium' },
  { keywords: ['节日', '庆典', '纪念日', '生日', '新年', '节日礼品'], scenario: 'occasion', description: '节日场景', necessityLevel: 'low' },
  { keywords: ['收藏', '爱好', '兴趣', '手办', '模型', '收藏品'], scenario: 'hobby', description: '爱好收藏场景', necessityLevel: 'low' }
];

// 品牌溢价分析数据
const brandPremiumData = {
  '服饰鞋包': {
    luxuryBrands: ['LV', 'Gucci', 'Prada', 'Chanel', 'Hermes', 'Dior', 'Armani', 'Burberry', 'Coach', 'MK'],
    premiumBrands: ['Nike', 'Adidas', 'Lululemon', 'Under Armour', 'Puma', 'New Balance'],
    budgetBrands: ['优衣库', 'Zara', 'H&M', 'Gap', 'Uniqlo']
  },
  '数码产品': {
    luxuryBrands: ['Apple', 'Sony', 'Samsung', 'Leica', 'Bose', 'Sony', 'Canon'],
    premiumBrands: ['华为', '小米', 'OPPO', 'vivo', '一加', '荣耀'],
    budgetBrands: ['红米', 'realme', 'iQOO', '传音']
  },
  '美妆护肤': {
    luxuryBrands: ['SK-II', 'La Mer', 'Estee Lauder', 'Lancome', 'Dior', 'Chanel', 'YSL', 'Guerlain'],
    premiumBrands: ['资生堂', '欧莱雅', '玉兰油', '倩碧', '欧舒丹'],
    budgetBrands: ['相宜本草', '百雀羚', '珀莱雅', '自然堂']
  },
  '家用电器': {
    luxuryBrands: ['戴森', 'Miele', 'Bosch', 'LG', '三星', 'Panasonic'],
    premiumBrands: ['美的', '格力', '海尔', '西门子', '方太'],
    budgetBrands: ['小米', '九阳', '苏泊尔', '美的']
  }
};

// 消费陷阱识别数据
const consumptionTraps = [
  { keywords: ['免费试用', '免费体验', '7天免费', '首月免费', '0元试用', '免费试用后', '试用到期'], name: '免费试用陷阱', risk: 'high', description: '免费试用后自动扣费，取消流程复杂', category: 'subscription_trap' },
  { keywords: ['自动续费', '自动续订', '连续包月', '自动扣款', '订阅', '会员自动', '包月自动'], name: '自动续费陷阱', risk: 'high', description: '订阅后自动扣费，容易忘记取消', category: 'subscription_trap' },
  { keywords: ['定金', '订金', '预售', '付定', '尾款', '定金不退', '订金不退'], name: '定金陷阱', risk: 'high', description: '定金不可退，限制消费者选择权', category: 'commitment_trap' },
  { keywords: ['以旧换新', '折价', '置换', '以旧换新补贴', '旧机回收'], name: '以旧换新陷阱', risk: 'medium', description: '旧机估值偏低，实际优惠有限', category: 'price_trap' },
  { keywords: ['返利', '返现', '返积分', '返券', '累计返利', '满额返现'], name: '返利陷阱', risk: 'medium', description: '返利条件苛刻，难以兑现', category: 'cashback_trap' },
  { keywords: ['抽奖', '幸运', '中奖', '概率', '随机', '抽奖赢', '幸运抽奖'], name: '抽奖陷阱', risk: 'medium', description: '中奖概率极低，诱导过度消费', category: 'gambling_trap' },
  { keywords: ['限量', '绝版', '仅剩', '最后一件', '限量发售', '限定'], name: '稀缺性陷阱', risk: 'high', description: '制造虚假稀缺感，迫使快速决策', category: 'scarcity_trap' },
  { keywords: ['直播间', '直播专属', '主播推荐', '直播福利', '直播秒杀'], name: '直播陷阱', risk: 'medium', description: '直播氛围营造冲动消费环境', category: 'social_trap' },
  { keywords: ['满减', '满赠', '凑单', '跨店满减', '满XX减'], name: '满减陷阱', risk: 'medium', description: '为凑优惠购买不必要商品', category: 'bundle_trap' },
  { keywords: ['套餐', '组合', '套装', '大礼包', '超值组合'], name: '捆绑销售陷阱', risk: 'medium', description: '强制捆绑低价值商品', category: 'bundle_trap' },
  { keywords: ['分期', '免息', '0利息', '分期付款', '分期优惠'], name: '分期陷阱', risk: 'medium', description: '隐藏手续费，实际利率高于宣传', category: 'payment_trap' },
  { keywords: ['原价', '划线价', '原价XX', '市场价', '吊牌价'], name: '价格锚定陷阱', risk: 'low', description: '虚构原价制造优惠错觉', category: 'price_anchor_trap' }
];

// 后悔指数评估因子
const regretFactors = [
  { keywords: ['想要', '喜欢', '好看', '心动'], weight: 0.8, reason: '情感驱动购买容易后悔' },
  { keywords: ['冲动', '心血来潮', '突然', '一时'], weight: 1.2, reason: '冲动购买事后容易后悔' },
  { keywords: ['无聊', '打发时间', '消遣'], weight: 0.9, reason: '无聊驱动购买实用性低' },
  { keywords: ['别人都买', '大家都有', '网红'], weight: 0.7, reason: '跟风购买容易后悔' },
  { keywords: ['犒劳', '奖励', '放纵'], weight: 0.6, reason: '奖励型消费后可能后悔' },
  { keywords: ['心情不好', '难过', '郁闷', '压力大'], weight: 1.1, reason: '情绪宣泄型消费后悔率高' },
  { keywords: ['限量', '绝版', '最后'], weight: 0.8, reason: '因稀缺性购买容易后悔' },
  { keywords: ['便宜', '划算', '超值', '白菜价'], weight: 0.5, reason: '因价格低购买可能用不上' },
  { keywords: ['新品', '首发', '全新'], weight: 0.4, reason: '新品溢价高，后续可能降价' },
  { keywords: ['收藏', '爱好', '兴趣'], weight: 0.3, reason: '爱好收藏类消费后悔率较低' },
  { keywords: ['需要', '必需', '刚需'], weight: -0.5, reason: '刚需购买后悔率低' },
  { keywords: ['工作', '学习', '办公'], weight: -0.4, reason: '实用型消费后悔率低' }
];

// 价格波动预测数据
const pricePatterns = {
  '数码产品': { seasonal_drop: ['6月', '11月', '1月'], new_release_drop: 30, avg_discount_rate: 0.3 },
  '服饰鞋包': { seasonal_drop: ['1月', '7月'], new_release_drop: 20, avg_discount_rate: 0.5 },
  '美妆护肤': { seasonal_drop: ['6月', '11月'], new_release_drop: 15, avg_discount_rate: 0.3 },
  '家用电器': { seasonal_drop: ['6月', '11月', '12月'], new_release_drop: 25, avg_discount_rate: 0.25 },
  '食品生鲜': { seasonal_drop: [], new_release_drop: 5, avg_discount_rate: 0.15 },
  '娱乐休闲': { seasonal_drop: ['12月'], new_release_drop: 35, avg_discount_rate: 0.4 }
};

// 替代品建议模板
const substituteTemplates = {
  '服饰鞋包': [
    '考虑购买基础款而非流行款，经典款式更耐用',
    '关注二手平台或品牌折扣店，同款商品可节省50%以上',
    '选择无品牌但质量好的替代品，性价比更高',
    '等待换季促销，反季购买可节省30%-50%'
  ],
  '数码产品': [
    '考虑上一代产品，性能差距不大但价格便宜30%-40%',
    '关注二手市场，成色好的二手产品性价比很高',
    '选择国产替代品牌，性能接近但价格低很多',
    '等待新品发布后购买旧款，通常会大幅降价'
  ],
  '美妆护肤': [
    '选择平替产品，很多国货品牌效果接近但价格低50%',
    '关注小样或旅行装，先试用再决定是否购买正装',
    '等待大促活动，套装价格通常比单品便宜20%-30%',
    '考虑成分相似的替代品，有效成分相同但品牌溢价高'
  ],
  '家用电器': [
    '选择功能相近但品牌知名度较低的产品',
    '关注电商平台的品牌日活动，通常有较大折扣',
    '考虑二手家电，很多家电使用寿命长，二手性价比高',
    '对比不同品牌的相同功能产品，价格差异可达30%'
  ],
  '娱乐休闲': [
    '考虑租赁而非购买，特别是使用频率低的物品',
    '关注免费或低成本替代品（如免费游戏、开源软件）',
    '等待会员促销活动，年卡通常比月卡划算',
    '考虑二手或共享经济平台'
  ],
  '其他': [
    '搜索同类商品的不同品牌，对比价格和评价',
    '考虑二手或闲置平台',
    '等待促销活动再购买',
    '评估是否真的需要购买，能否借用或替代'
  ]
};

// 行业基准数据 - 各类别市场概况
const industryBenchmarks = {
  '服饰鞋包': {
    marketSize: '万亿级',
    growthRate: 0.08,
    brandConcentration: '中',
    priceDistribution: {
      budget: { min: 0, max: 300, share: 0.45 },
      midRange: { min: 300, max: 1500, share: 0.35 },
      premium: { min: 1500, max: 5000, share: 0.15 },
      luxury: { min: 5000, max: Infinity, share: 0.05 }
    },
    seasonalPatterns: { peak: ['11月', '12月', '6月'], low: ['3月', '4月'] },
    competitiveIntensity: '高'
  },
  '数码产品': {
    marketSize: '千亿级',
    growthRate: 0.12,
    brandConcentration: '高',
    priceDistribution: {
      budget: { min: 0, max: 1000, share: 0.25 },
      midRange: { min: 1000, max: 3000, share: 0.35 },
      premium: { min: 3000, max: 6000, share: 0.30 },
      luxury: { min: 6000, max: Infinity, share: 0.10 }
    },
    seasonalPatterns: { peak: ['6月', '11月', '1月'], low: ['4月', '5月'] },
    competitiveIntensity: '极高'
  },
  '美妆护肤': {
    marketSize: '千亿级',
    growthRate: 0.15,
    brandConcentration: '中',
    priceDistribution: {
      budget: { min: 0, max: 200, share: 0.40 },
      midRange: { min: 200, max: 800, share: 0.40 },
      premium: { min: 800, max: 2000, share: 0.15 },
      luxury: { min: 2000, max: Infinity, share: 0.05 }
    },
    seasonalPatterns: { peak: ['6月', '11月'], low: ['2月', '8月'] },
    competitiveIntensity: '高'
  },
  '家用电器': {
    marketSize: '千亿级',
    growthRate: 0.05,
    brandConcentration: '高',
    priceDistribution: {
      budget: { min: 0, max: 500, share: 0.30 },
      midRange: { min: 500, max: 2000, share: 0.40 },
      premium: { min: 2000, max: 5000, share: 0.20 },
      luxury: { min: 5000, max: Infinity, share: 0.10 }
    },
    seasonalPatterns: { peak: ['6月', '11月', '12月'], low: ['1月', '2月'] },
    competitiveIntensity: '中'
  },
  '食品生鲜': {
    marketSize: '万亿级',
    growthRate: 0.20,
    brandConcentration: '低',
    priceDistribution: {
      budget: { min: 0, max: 100, share: 0.50 },
      midRange: { min: 100, max: 300, share: 0.35 },
      premium: { min: 300, max: 500, share: 0.10 },
      luxury: { min: 500, max: Infinity, share: 0.05 }
    },
    seasonalPatterns: { peak: ['12月', '1月'], low: ['3月', '4月'] },
    competitiveIntensity: '中'
  },
  '家具家居': {
    marketSize: '千亿级',
    growthRate: 0.06,
    brandConcentration: '低',
    priceDistribution: {
      budget: { min: 0, max: 800, share: 0.35 },
      midRange: { min: 800, max: 3000, share: 0.40 },
      premium: { min: 3000, max: 8000, share: 0.15 },
      luxury: { min: 8000, max: Infinity, share: 0.10 }
    },
    seasonalPatterns: { peak: ['6月', '11月'], low: ['1月', '2月'] },
    competitiveIntensity: '中'
  },
  '娱乐休闲': {
    marketSize: '千亿级',
    growthRate: 0.25,
    brandConcentration: '低',
    priceDistribution: {
      budget: { min: 0, max: 200, share: 0.50 },
      midRange: { min: 200, max: 800, share: 0.30 },
      premium: { min: 800, max: 2000, share: 0.15 },
      luxury: { min: 2000, max: Infinity, share: 0.05 }
    },
    seasonalPatterns: { peak: ['12月', '7月'], low: ['3月', '4月'] },
    competitiveIntensity: '高'
  },
  '图书文具': {
    marketSize: '百亿级',
    growthRate: 0.03,
    brandConcentration: '低',
    priceDistribution: {
      budget: { min: 0, max: 100, share: 0.60 },
      midRange: { min: 100, max: 300, share: 0.30 },
      premium: { min: 300, max: 500, share: 0.08 },
      luxury: { min: 500, max: Infinity, share: 0.02 }
    },
    seasonalPatterns: { peak: ['9月', '1月'], low: ['2月', '7月'] },
    competitiveIntensity: '低'
  },
  '其他': {
    marketSize: '百亿级',
    growthRate: 0.10,
    brandConcentration: '低',
    priceDistribution: {
      budget: { min: 0, max: 500, share: 0.50 },
      midRange: { min: 500, max: 2000, share: 0.35 },
      premium: { min: 2000, max: 5000, share: 0.10 },
      luxury: { min: 5000, max: Infinity, share: 0.05 }
    },
    seasonalPatterns: { peak: ['11月', '12月'], low: ['3月', '4月'] },
    competitiveIntensity: '中'
  }
};

// 竞品数据库
const competitorDatabase = {
  '服饰鞋包': {
    productTypes: ['运动鞋', '休闲鞋', '皮鞋', 'T恤', '外套', '包包'],
    competitors: [
      { productType: '运动鞋', brands: ['Nike', 'Adidas', '李宁', '安踏', '特步'], avgPrice: { budget: 200, midRange: 500, premium: 1000 } },
      { productType: 'T恤', brands: ['优衣库', 'Zara', 'H&M', 'Gap', 'Nike'], avgPrice: { budget: 50, midRange: 150, premium: 300 } },
      { productType: '包包', brands: ['Coach', 'MK', 'Furla', 'MCM', 'LV'], avgPrice: { budget: 500, midRange: 2000, premium: 8000 } }
    ]
  },
  '数码产品': {
    productTypes: ['手机', '笔记本电脑', '耳机', '手表', '平板'],
    competitors: [
      { productType: '手机', brands: ['iPhone', '华为', '小米', 'OPPO', 'vivo'], avgPrice: { budget: 1000, midRange: 3000, premium: 6000 } },
      { productType: '耳机', brands: ['AirPods', '华为FreeBuds', '小米Air', 'Sony', 'Bose'], avgPrice: { budget: 200, midRange: 600, premium: 1500 } },
      { productType: '笔记本电脑', brands: ['MacBook', 'ThinkPad', '戴尔', '华硕', '小米'], avgPrice: { budget: 3000, midRange: 6000, premium: 12000 } }
    ]
  },
  '美妆护肤': {
    productTypes: ['面霜', '精华', '口红', '面膜', '洗面奶'],
    competitors: [
      { productType: '面霜', brands: ['SK-II', 'La Mer', '欧莱雅', '玉兰油', '百雀羚'], avgPrice: { budget: 100, midRange: 400, premium: 1500 } },
      { productType: '口红', brands: ['YSL', 'Dior', 'Mac', '欧莱雅', '完美日记'], avgPrice: { budget: 80, midRange: 200, premium: 350 } },
      { productType: '面膜', brands: ['SK-II', '蒂佳婷', '美即', '百雀羚', '相宜本草'], avgPrice: { budget: 50, midRange: 150, premium: 500 } }
    ]
  },
  '家用电器': {
    productTypes: ['空调', '冰箱', '洗衣机', '吸尘器', '电饭煲'],
    competitors: [
      { productType: '空调', brands: ['格力', '美的', '海尔', '海信', '小米'], avgPrice: { budget: 2000, midRange: 4000, premium: 8000 } },
      { productType: '吸尘器', brands: ['戴森', '美的', '海尔', '小狗', '小米'], avgPrice: { budget: 500, midRange: 1500, premium: 3500 } },
      { productType: '电饭煲', brands: ['美的', '苏泊尔', '九阳', '东芝', '虎牌'], avgPrice: { budget: 300, midRange: 800, premium: 2000 } }
    ]
  },
  '家具家居': {
    productTypes: ['沙发', '床', '桌椅', '柜子', '灯具'],
    competitors: [
      { productType: '沙发', brands: ['宜家', '顾家', '左右', '芝华士', '爱依瑞斯'], avgPrice: { budget: 2000, midRange: 5000, premium: 15000 } },
      { productType: '办公椅', brands: ['赫曼米勒', '冈村', '保友', '永艺', '小米'], avgPrice: { budget: 500, midRange: 1500, premium: 5000 } }
    ]
  },
  '娱乐休闲': {
    productTypes: ['游戏机', '耳机', '运动器材', '乐器', '手办'],
    competitors: [
      { productType: '游戏机', brands: ['PlayStation', 'Xbox', 'Switch', 'Steam Deck'], avgPrice: { budget: 2000, midRange: 3000, premium: 5000 } },
      { productType: '运动器材', brands: ['迪卡侬', '李宁', 'Nike', '阿迪达斯', 'Keep'], avgPrice: { budget: 100, midRange: 500, premium: 2000 } }
    ]
  }
};

// 价格指标数据
const priceIndicatorData = {
  priceSensitivity: {
    '服饰鞋包': 0.8,
    '数码产品': 0.6,
    '美妆护肤': 0.9,
    '家用电器': 0.5,
    '食品生鲜': 1.0,
    '家具家居': 0.4,
    '娱乐休闲': 0.7,
    '图书文具': 0.95,
    '其他': 0.7
  },
  priceVolatility: {
    '服饰鞋包': 0.7,
    '数码产品': 0.8,
    '美妆护肤': 0.6,
    '家用电器': 0.4,
    '食品生鲜': 0.5,
    '家具家居': 0.3,
    '娱乐休闲': 0.75,
    '图书文具': 0.3,
    '其他': 0.5
  },
  priceElasticity: {
    '服饰鞋包': 1.5,
    '数码产品': 1.2,
    '美妆护肤': 1.8,
    '家用电器': 0.8,
    '食品生鲜': 2.5,
    '家具家居': 0.5,
    '娱乐休闲': 1.4,
    '图书文具': 2.0,
    '其他': 1.0
  },
  sensitivityAdjustment: {
    '服饰鞋包': 0.85,
    '数码产品': 0.95,
    '美妆护肤': 0.80,
    '家用电器': 1.10,
    '食品生鲜': 0.75,
    '家具家居': 1.20,
    '娱乐休闲': 0.90,
    '图书文具': 0.78,
    '其他': 1.0
  },
  discountSeasonality: {
    '618': { categories: ['数码产品', '家用电器', '服饰鞋包'], discountRate: 0.25 },
    '双11': { categories: ['全部'], discountRate: 0.3 },
    '双12': { categories: ['服饰鞋包', '美妆护肤'], discountRate: 0.2 },
    '年货节': { categories: ['食品生鲜', '家居'], discountRate: 0.15 },
    '开学季': { categories: ['数码产品', '图书文具'], discountRate: 0.15 },
    '夏日促销': { categories: ['服饰鞋包', '空调'], discountRate: 0.2 }
  }
};

// 社交影响关键词
const socialInfluenceKeywords = [
  { keywords: ['朋友圈', '小红书', '抖音', '微博', '种草', '安利', '测评', '推荐'], type: 'social_media', weight: 1.5, description: '社交媒体影响' },
  { keywords: ['同事', '朋友', '闺蜜', '同学', '家人', '老婆', '老公', '孩子'], type: 'social_pressure', weight: 1.8, description: '社交压力影响' },
  { keywords: ['攀比', '别人都有', '不能输', '也要', '同款', '一样', '比他好'], type: 'comparison', weight: 2.2, description: '攀比心理影响' },
  { keywords: ['面子', '身份', '地位', '档次', '品味', '格调', '高端'], type: 'status_seeking', weight: 2.0, description: '身份地位追求' },
  { keywords: ['炫耀', '晒图', '秀', '展示', '分享', '动态', '朋友圈'], type: 'show_off', weight: 1.7, description: '炫耀心理影响' },
  { keywords: ['群里', '大家都买', '团购', '拼单', '一起买'], type: 'group_influence', weight: 1.6, description: '群体影响' }
];

// 决策疲劳指标
const decisionFatigueIndicators = [
  { keywords: ['纠结', '不知道', '选哪个', '太难了', '挑花眼', '眼花缭乱'], type: 'indecision', weight: 1.5 },
  { keywords: ['随便', '都行', '差不多', '懒得选', '不想选'], type: 'apathy', weight: 2.0 },
  { keywords: ['快速', '快点', '赶紧选', '没时间', '着急'], type: 'rush', weight: 1.8 },
  { keywords: ['看了很久', '逛了半天', '选了好久', '比较了很多'], type: 'overthinking', weight: 1.6 },
  { keywords: ['累', '疲惫', '烦', '不想看了', '头疼'], type: 'fatigue', weight: 2.5 }
];

// 消费心理分析
const consumptionPsychology = {
  emotional_states: [
    { keywords: ['开心', '高兴', '快乐', '兴奋'], state: 'happy', risk_multiplier: 1.2, description: '愉悦状态下的消费倾向' },
    { keywords: ['难过', '伤心', '郁闷', '失落'], state: 'sad', risk_multiplier: 2.5, description: '悲伤状态下的补偿性消费' },
    { keywords: ['焦虑', '紧张', '担心', '不安'], state: 'anxious', risk_multiplier: 2.0, description: '焦虑状态下的缓解性消费' },
    { keywords: ['无聊', '空虚', '无聊', '乏味'], state: 'bored', risk_multiplier: 1.8, description: '无聊状态下的消遣性消费' },
    { keywords: ['压力大', '疲惫', '累', '压力大'], state: 'stressed', risk_multiplier: 2.3, description: '压力状态下的减压性消费' },
    { keywords: ['自信', '满意', '满足', '充实'], state: 'confident', risk_multiplier: 0.8, description: '自信状态下的理性消费' }
  ],
  motivation_types: [
    { keywords: ['需要', '必需', '刚需', '必要'], motivation: 'need', description: '需求驱动型消费', rationality: 'high' },
    { keywords: ['想要', '喜欢', '想要', '心动'], motivation: 'want', description: '欲望驱动型消费', rationality: 'low' },
    { keywords: ['改善', '提升', '升级', '优化'], motivation: 'improve', description: '改善驱动型消费', rationality: 'medium' },
    { keywords: ['尝试', '体验', '试试', '尝鲜'], motivation: 'try', description: '尝试驱动型消费', rationality: 'low' },
    { keywords: ['收藏', '珍藏', '纪念', '收藏'], motivation: 'collect', description: '收藏驱动型消费', rationality: 'medium' },
    { keywords: ['送礼', '礼物', '送人', '赠礼'], motivation: 'gift', description: '送礼驱动型消费', rationality: 'medium' }
  ]
};

app.post('/api/users/register', (req, res) => {
  try {
    const { username, email } = req.body;
    const user = {
      id: nextUserId++,
      username,
      email,
      created_at: new Date().toISOString()
    };
    database.users.push(user);
    res.json({ success: true, userId: user.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = database.users.find(u => u.id === parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: '用户不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze', (req, res) => {
  try {
    const { userId, productName, price, category, description, reason } = req.body;
    const currentUserId = userId || 1;
    
    // 获取用户历史记录用于个性化分析
    const userHistory = database.analysis_records.filter(r => r.user_id === currentUserId);
    
    const analysis = analyzePurchase(productName, price, category, description, reason, userHistory);
    
    const record = {
      id: nextRecordId++,
      user_id: currentUserId,
      product_name: productName,
      price: price,
      category: category,
      decision: analysis.recommendation,
      risk_level: analysis.riskLevel,
      detected_tactics: analysis.detectedTactics.map(t => t.name),
      saved_amount: analysis.recommendation === 'reject' ? price : 0,
      created_at: new Date().toISOString()
    };
    
    database.analysis_records.unshift(record);
    
    res.json({ 
      success: true, 
      recordId: record.id,
      analysis 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 消费习惯诊断报告API
app.get('/api/diagnostic/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const report = generateDiagnosticReport(userId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history/:userId', (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = parseInt(req.params.userId);
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const records = database.analysis_records.filter(r => 
      r.user_id === userId && new Date(r.created_at) >= cutoffDate
    );
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentRecords = database.analysis_records.filter(r => 
      r.user_id === userId && new Date(r.created_at) >= cutoffDate
    );
    
    const totalSaved = recentRecords.reduce((sum, r) => sum + r.saved_amount, 0);
    const rejectCount = recentRecords.filter(r => r.decision === 'reject').length;
    const acceptCount = recentRecords.filter(r => r.decision === 'accept').length;
    
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
    
    // 近7天趋势数据
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayRecords = recentRecords.filter(r => r.created_at.startsWith(dateStr));
      last7Days.push({
        date: dateStr,
        day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
        analyzed: dayRecords.length,
        accepted: dayRecords.filter(r => r.decision === 'accept').length,
        rejected: dayRecords.filter(r => r.decision === 'reject').length,
        saved: dayRecords.reduce((sum, r) => sum + r.saved_amount, 0)
      });
    }
    
    // 风险分布
    const riskDistribution = {
      high: recentRecords.filter(r => r.risk_level === 'high').length,
      medium: recentRecords.filter(r => r.risk_level === 'medium' || r.risk_level === 'low-medium').length,
      low: recentRecords.filter(r => r.risk_level === 'low').length
    };
    
    // 营销套路统计
    const tacticStats = {};
    recentRecords.forEach(r => {
      if (r.detected_tactics) {
        r.detected_tactics.forEach(t => {
          if (!tacticStats[t]) {
            tacticStats[t] = 0;
          }
          tacticStats[t] += 1;
        });
      }
    });
    
    res.json({
      totalSaved,
      rejectCount,
      acceptCount,
      totalAnalyzed: recentRecords.length,
      categoryStats,
      streak: calculateStreak(recentRecords),
      weeklyTrend: last7Days,
      riskDistribution,
      tacticStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/budget/set', (req, res) => {
  try {
    const { userId, monthlyBudget, categories } = req.body;
    
    const existing = database.budget_settings.find(b => b.user_id === userId);
    if (existing) {
      existing.monthly_budget = monthlyBudget;
      existing.categories = categories;
      res.json({ success: true, budgetId: existing.id });
    } else {
      const budget = {
        id: nextBudgetId++,
        user_id: userId,
        monthly_budget: monthlyBudget,
        categories: categories,
        created_at: new Date().toISOString()
      };
      database.budget_settings.push(budget);
      res.json({ success: true, budgetId: budget.id });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/budget/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const budget = database.budget_settings.find(b => b.user_id === userId);
    
    if (budget) {
      // 计算本月实际消费
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRecords = database.analysis_records.filter(r => 
        r.user_id === userId && 
        new Date(r.created_at) >= startOfMonth &&
        r.decision === 'accept'
      );
      
      // 计算各类别消费
      const categorySpending = {};
      monthlyRecords.forEach(r => {
        if (!categorySpending[r.category]) {
          categorySpending[r.category] = 0;
        }
        categorySpending[r.category] += r.price;
      });
      
      // 添加消费数据到预算对象
      const budgetWithSpending = {
        ...budget,
        spending: categorySpending,
        totalSpent: monthlyRecords.reduce((sum, r) => sum + r.price, 0),
        recordCount: monthlyRecords.length
      };
      
      res.json(budgetWithSpending);
    } else {
      res.json({ 
        id: null,
        user_id: userId,
        monthly_budget: 5000,
        categories: { '服饰鞋包': 1000, '数码产品': 1500, '美食餐饮': 1000, '娱乐休闲': 800, '其他': 700 },
        spending: {},
        totalSpent: 0,
        recordCount: 0
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tactics', (req, res) => {
  res.json(marketingTactics);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 优化后的消费分析算法
function analyzePurchase(productName, price, category, description, reason, userHistory = null) {
  const detectedTactics = [];
  let riskScore = 0;
  
  // 合并所有文本进行分析
  const fullText = productName + ' ' + (description || '') + ' ' + (reason || '');
  const textLower = fullText.toLowerCase();
  
  // 1. 营销套路检测（增强版）
  const tacticCategories = {};
  for (const tactic of marketingTactics) {
    const matchedKeywords = [];
    for (const keyword of tactic.keyword) {
      const keywordLower = keyword.toLowerCase();
      if (textLower.includes(keywordLower)) {
        matchedKeywords.push(keyword);
      }
    }
    if (matchedKeywords.length > 0) {
      detectedTactics.push({
        name: tactic.name,
        risk: tactic.risk,
        description: tactic.description,
        matchedKeywords: matchedKeywords,
        category: tactic.category
      });
      
      // 按类别统计套路
      if (!tacticCategories[tactic.category]) {
        tacticCategories[tactic.category] = [];
      }
      tacticCategories[tactic.category].push(tactic.name);
      
      // 根据风险等级和匹配数量计算权重
      const baseWeight = tactic.risk === 'high' ? 3.0 : tactic.risk === 'medium' ? 2.0 : 1.0;
      const matchBonus = matchedKeywords.length > 1 ? 0.5 : 0;
      riskScore += baseWeight + matchBonus;
    }
  }
  
  // 套路叠加效应：多个套路叠加时风险倍增
  if (detectedTactics.length >= 3) {
    riskScore *= 1.3;
  } else if (detectedTactics.length >= 5) {
    riskScore *= 1.5;
  }
  
  // 同类套路叠加效应
  const highRiskCategories = ['urgency', 'scarcity', 'price_pressure'];
  for (const category of highRiskCategories) {
    if (tacticCategories[category] && tacticCategories[category].length >= 2) {
      riskScore += 1.5;
    }
  }
  
  // 2. 冲动消费倾向检测（增强版）
  let impulseScore = 0;
  let impulseReasons = [];
  let impulseDetails = [];
  
  // 直接使用全局 impulseIndicators
  for (let i = 0; i < impulseIndicators.length; i++) {
    const indicator = impulseIndicators[i];
    for (let j = 0; j < indicator.keyword.length; j++) {
      const keyword = indicator.keyword[j];
      if (textLower.indexOf(keyword.toLowerCase()) !== -1) {
        impulseScore += indicator.weight;
        if (!impulseReasons.includes(indicator.type)) {
          impulseReasons.push(indicator.type);
          impulseDetails.push({
            type: indicator.type,
            description: indicator.description,
            weight: indicator.weight,
            matchedKeyword: keyword
          });
        }
      }
    }
  }
  
  // 3. 消费场景智能识别
  const scenarioAnalysis = identifyConsumptionScenario(productName, description, category);
  
  // 4. 消费心理分析
  const psychologyAnalysis = analyzeConsumptionPsychology(reason, description);
  
  // 5. 价格合理性评估（增强版）
  const priceThresholds = getPriceThreshold(category);
  const priceThreshold = priceThresholds.medium;
  const categoryAvgPrice = userHistory ? getCategoryAvgPrice(userHistory, category) : priceThreshold;
  const reasonablePrice = categoryAvgPrice * 1.2;
  
  let priceAssessment = {
    isHigh: price > priceThreshold,
    priceRatio: price / priceThreshold,
    categoryAvg: categoryAvgPrice,
    thresholds: priceThresholds,
    assessment: '合理',
    priceLevel: 'normal'
  };
  
  // 价格风险评估（多维度）
  if (price > priceThresholds.high) {
    riskScore += 4;
    priceAssessment.assessment = '价格偏高';
    priceAssessment.priceLevel = 'high';
  } else if (price > priceThresholds.medium) {
    riskScore += 2;
    priceAssessment.assessment = '略高于平均';
    priceAssessment.priceLevel = 'medium-high';
  } else if (price > priceThresholds.low && price < priceThresholds.medium) {
    priceAssessment.assessment = '价格适中';
    priceAssessment.priceLevel = 'medium';
  } else if (price < priceThresholds.low * 0.5) {
    riskScore += 1.5;
    priceAssessment.assessment = '异常低价需警惕';
    priceAssessment.priceLevel = 'abnormal-low';
  } else {
    priceAssessment.assessment = '价格合理';
    priceAssessment.priceLevel = 'low';
  }
  
  // 价格与收入比例评估（假设月收入5000）
  const monthlyIncome = 5000;
  const priceRatioToIncome = price / monthlyIncome;
  if (priceRatioToIncome > 0.3) {
    riskScore += 2;
    priceAssessment.incomeRatioWarning = true;
  }
  
  // 6. 商品名称关键词分析
  const productAnalysis = analyzeProductKeywords(productName);
  riskScore += productAnalysis.riskScore;
  
  // 7. 必需性评估
  const necessityAnalysis = evaluateNecessity(scenarioAnalysis, psychologyAnalysis, category);
  
  // 8. 品牌溢价分析
  const brandAnalysis = analyzeBrandPremium(productName, category, price);
  if (brandAnalysis.premiumScore > 0) {
    riskScore += brandAnalysis.premiumScore;
  }
  
  // 9. 社交影响分析
  const socialAnalysis = analyzeSocialInfluence(reason, description, productName);
  riskScore += socialAnalysis.influenceScore * 0.5;
  
  // 10. 决策疲劳检测
  const fatigueAnalysis = detectDecisionFatigue(reason, description);
  if (fatigueAnalysis.fatigueScore > 0) {
    riskScore += fatigueAnalysis.fatigueScore;
  }
  
  // 11. 购买频率分析
  const purchaseFrequencyAnalysis = analyzePurchaseFrequency(userHistory, category, productName);
  
  // 12. 价格历史对比分析
  const priceHistoryAnalysis = analyzePriceHistory(userHistory, category, price);
  
  // 13. 消费陷阱识别（新增）
  const trapAnalysis = identifyConsumptionTraps(productName, description, reason);
  if (trapAnalysis.detectedTraps.length > 0) {
    riskScore += trapAnalysis.trapRiskScore;
  }
  
  // 14. 后悔指数评估（新增）
  const regretAnalysis = calculateRegretIndex(productName, description, reason, category);
  
  // 15. 价格波动预测（新增）
  const pricePrediction = predictPriceMovement(category, price);

  // 15.5 价格变化趋势分析（增强版）
  const priceTrendAnalysis = analyzePriceTrend(productName, price, category);

  // 16. 价格指标分析（新增）
  const priceIndicatorAnalysis = analyzePriceIndicator(productName, price, category);

  // 17. 行业情况分析（新增）
  const industryAnalysis = analyzeIndustrySituation(category);

  // 18. 竞品对比分析（新增）
  const competitorAnalysis = analyzeCompetitors(productName, price, category);
  
  // 19. 综合风险计算（优化版 - 科学权重体系）
  // 计算营销套路风险评分
  const marketingRiskScore = detectedTactics.reduce((sum, t) => {
    return sum + (t.risk === 'high' ? 1 : t.risk === 'medium' ? 0.6 : 0.3);
  }, 0);
  
  const sensitivity = priceIndicatorData.priceSensitivity[category] || 0.7;
  const elasticity = priceIndicatorData.priceElasticity[category] || 1.0;
  
  const sensitivityMultiplier = 0.6 + sensitivity * 0.8;
  const elasticityMultiplier = 0.8 + (elasticity - 1) * 0.3;
  const combinedMultiplier = Math.min(sensitivityMultiplier * elasticityMultiplier, 2.0);
  
  const basePriceScore = price > priceThresholds.high ? 1 : Math.min(Math.max(0, price - priceThresholds.low) / (priceThresholds.high - priceThresholds.low), 1);
  const sensitivityAdjustedPriceScore = Math.min(basePriceScore * combinedMultiplier, 1);
  
  const basePriceIndicatorScore = priceIndicatorAnalysis.hasData ? Math.min(priceIndicatorAnalysis.priceIndicatorScore / 2, 1) : 0;
  const sensitivityAdjustedPriceIndicatorScore = Math.min(basePriceIndicatorScore * sensitivityMultiplier, 1);

  const priceWeightAdjustment = 0.8 + sensitivity * 0.4;
  const basePriceWeight = 0.13;
  const adjustedPriceWeight = Math.min(basePriceWeight * priceWeightAdjustment, 0.18);
  
  const basePriceIndicatorWeight = 0.06;
  const adjustedPriceIndicatorWeight = Math.min(basePriceIndicatorWeight * priceWeightAdjustment, 0.10);

  const dimensions = {
    marketing: { score: Math.min(marketingRiskScore / 12, 1), weight: 0.18, name: '营销套路' },
    impulse: { score: Math.min(impulseScore / 25, 1), weight: 0.16, name: '冲动程度' },
    psychology: { score: Math.min(Math.max(0, psychologyAnalysis.riskMultiplier - 0.5) / 2.0, 1), weight: 0.07, name: '心理状态' },
    price: { score: sensitivityAdjustedPriceScore, weight: adjustedPriceWeight, name: '价格风险' },
    necessity: { score: Math.min(Math.max(0, 1 - necessityAnalysis.necessityScore / 10), 1), weight: 0.10, name: '必需程度' },
    trap: { score: Math.min(trapAnalysis.trapRiskScore / 15, 1), weight: 0.09, name: '消费陷阱' },
    regret: { score: Math.min(regretAnalysis.regretScore / 10, 1), weight: 0.09, name: '后悔指数' },
    brand: { score: Math.min(brandAnalysis.premiumScore / 3, 1), weight: 0.06, name: '品牌溢价' },
    priceIndicator: { score: sensitivityAdjustedPriceIndicatorScore, weight: adjustedPriceIndicatorWeight, name: '价格指标' },
    competitor: { score: competitorAnalysis.comparisonResult === 'overpriced' ? 1 : competitorAnalysis.comparisonResult === 'slightly_overpriced' ? 0.5 : competitorAnalysis.comparisonResult === 'very_low' ? 0.6 : 0, weight: 0.06, name: '竞品对比' }
  };
  
  let weightedScore = 0;
  let totalWeight = 0;
  const dimensionDetails = [];
  
  for (const [key, dim] of Object.entries(dimensions)) {
    const contribution = dim.score * dim.weight;
    weightedScore += contribution;
    totalWeight += dim.weight;
    dimensionDetails.push({
      name: dim.name,
      score: Math.round(dim.score * 100) / 100,
      weight: dim.weight * 100,
      contribution: Math.round(contribution * 100) / 100
    });
  }
  
  const normalizedScore = weightedScore / totalWeight;
  const finalScore = Math.min(10, Math.round(normalizedScore * 100) / 10);
  
  let riskLevel = 'safe';
  let recommendation = 'accept';
  let recommendationText = '可以购买';
  let warnings = [];
  
  // 风险等级判定（更精细的分级）
  if (finalScore >= 8.0) {
    riskLevel = 'high';
    recommendation = 'reject';
    recommendationText = '强烈不建议购买';
    warnings.push('🚨 检测到极高风险，强烈建议放弃购买');
  } else if (finalScore >= 6.5) {
    riskLevel = 'medium-high';
    recommendation = 'reject';
    recommendationText = '不建议购买';
    warnings.push('⚠️ 检测到高风险，建议放弃购买');
  } else if (finalScore >= 5.0) {
    riskLevel = 'medium';
    recommendation = 'wait';
    recommendationText = '建议观望';
    warnings.push('⏰ 存在较高风险，建议冷静思考48小时后再决定');
  } else if (finalScore >= 3) {
    riskLevel = 'medium';
    recommendation = 'caution';
    recommendationText = '谨慎考虑';
    warnings.push('💡 存在一定风险，建议对比同类产品，确认实际需求');
  } else if (finalScore >= 1.5) {
    riskLevel = 'low-medium';
    recommendation = 'consider';
    recommendationText = '可以考虑';
    warnings.push('📝 建议仔细评估性价比和实际需求');
  } else {
    riskLevel = 'low';
    recommendation = 'accept';
    recommendationText = '可以购买';
  }
  
  // 冲动消费警告（分级）
  if (impulseScore >= 6) {
    warnings.push('🚨 检测到强烈的冲动消费倾向，请务必冷静！');
  } else if (impulseScore >= 4) {
    warnings.push('⚠️ 检测到明显的冲动消费倾向，请冷静思考');
  } else if (impulseScore >= 2) {
    warnings.push('💡 存在一定的冲动消费倾向，建议理性思考');
  }
  
  // 套路检测警告（分级）
  if (detectedTactics.length > 0) {
    const highRiskTactics = detectedTactics.filter(t => t.risk === 'high');
    if (highRiskTactics.length >= 3) {
      warnings.push('🚨 多种高风险营销套路叠加，请特别谨慎！');
    } else if (highRiskTactics.length >= 2) {
      warnings.push('⚠️ 多种高风险营销套路叠加，请格外谨慎');
    } else if (detectedTactics.length >= 3) {
      warnings.push('💡 检测到多种营销套路，建议理性分析');
    }
  }
  
  // 心理状态警告
  if (psychologyAnalysis.emotionalState && psychologyAnalysis.riskMultiplier > 2) {
    warnings.push(`🧠 当前心理状态（${psychologyAnalysis.emotionalState.description}）可能影响决策理性`);
  }
  
  // 价格警告
  if (priceAssessment.incomeRatioWarning) {
    warnings.push(`💰 此商品价格占月收入${(priceRatioToIncome * 100).toFixed(0)}%，请慎重考虑`);
  }
  
  // 必需性提醒
  if (necessityAnalysis.necessityLevel === 'low') {
    warnings.push(`📦 此商品属于低必需性消费，建议评估实际需求`);
  }
  
  // 生成个性化建议（增强版）
  const suggestions = generateEnhancedSuggestions(
    finalScore, price, category, detectedTactics, impulseScore, 
    priceAssessment, scenarioAnalysis, psychologyAnalysis, necessityAnalysis
  );
  
  // 生成洞察（增强版）
  const insights = generateEnhancedInsights(
    productName, price, category, detectedTactics, riskLevel, 
    priceAssessment, scenarioAnalysis, psychologyAnalysis
  );
  
  // 生成决策树
  const decisionTree = generateDecisionTree(
    detectedTactics, impulseScore, priceAssessment, 
    scenarioAnalysis, psychologyAnalysis, necessityAnalysis
  );
  
  return {
    riskLevel,
    riskScore: finalScore,
    impulseScore,
    recommendation,
    recommendationText,
    warnings,
    detectedTactics,
    insights,
    suggestions,
    dimensionAnalysis: dimensionDetails,
    priceAnalysis: {
      amount: price,
      threshold: priceThreshold,
      categoryAvg: categoryAvgPrice,
      reasonablePrice: reasonablePrice,
      exceedsThreshold: price > priceThreshold,
      assessment: priceAssessment.assessment,
      priceLevel: priceAssessment.priceLevel,
      incomeRatio: priceRatioToIncome,
      incomeRatioWarning: priceAssessment.incomeRatioWarning,
      priceHistory: priceHistoryAnalysis
    },
    productAnalysis: productAnalysis,
    scenarioAnalysis: scenarioAnalysis,
    psychologyAnalysis: psychologyAnalysis,
    necessityAnalysis: necessityAnalysis,
    impulseDetails: impulseDetails,
    brandAnalysis: brandAnalysis,
    socialAnalysis: socialAnalysis,
    fatigueAnalysis: fatigueAnalysis,
    purchaseFrequencyAnalysis: purchaseFrequencyAnalysis,
    trapAnalysis: trapAnalysis,
    regretAnalysis: regretAnalysis,
    pricePrediction: pricePrediction,
    priceTrendAnalysis: priceTrendAnalysis,
    priceIndicatorAnalysis: priceIndicatorAnalysis,
    industryAnalysis: industryAnalysis,
    competitorAnalysis: competitorAnalysis,
    decisionTree: decisionTree,
    analysisMetadata: {
      analysisTime: new Date().toISOString(),
      version: '7.0',
      confidence: calculateConfidence(detectedTactics, impulseScore, psychologyAnalysis, trapAnalysis)
    }
  };
}

// 分析商品名称关键词
function analyzeProductKeywords(productName) {
  let riskScore = 0;
  const findings = [];
  
  // 高风险词汇
  const highRiskWords = ['秒杀', '限量', '绝版', '爆款', '断货', '网红', '明星同款', '亏本', '清仓'];
  highRiskWords.forEach(word => {
    if (productName.includes(word)) {
      riskScore += 0.8;
      findings.push({ word, risk: 'high', reason: '制造紧迫感' });
    }
  });
  
  // 中风险词汇
  const mediumRiskWords = ['套装', '套餐', '组合', '大礼包', '超值', '特惠'];
  mediumRiskWords.forEach(word => {
    if (productName.includes(word)) {
      riskScore += 0.5;
      findings.push({ word, risk: 'medium', reason: '可能存在捆绑销售' });
    }
  });
  
  // 警惕词汇
  const warningWords = ['预售', '定金', '尾款', '付定'];
  warningWords.forEach(word => {
    if (productName.includes(word)) {
      riskScore += 1;
      findings.push({ word, risk: 'warning', reason: '预售套路风险' });
    }
  });
  
  return { riskScore, findings };
}

// 获取用户历史中该类别的平均价格
function getCategoryAvgPrice(userHistory, category) {
  const categoryRecords = userHistory.filter(r => r.category === category);
  if (categoryRecords.length === 0) {
    return getPriceThreshold(category);
  }
  const total = categoryRecords.reduce((sum, r) => sum + r.price, 0);
  return total / categoryRecords.length;
}

// 消费场景智能识别
function identifyConsumptionScenario(productName, description, category) {
  const fullText = productName + ' ' + (description || '');
  const textLower = fullText.toLowerCase();
  
  const matchedScenarios = [];
  for (const scenario of consumptionScenarios) {
    for (const keyword of scenario.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        matchedScenarios.push({
          scenario: scenario.scenario,
          description: scenario.description,
          necessityLevel: scenario.necessityLevel,
          matchedKeyword: keyword
        });
        break;
      }
    }
  }
  
  // 如果没有匹配到场景，根据类别推断
  if (matchedScenarios.length === 0) {
    const categoryScenarioMap = {
      '服饰鞋包': { scenario: 'fashion', description: '时尚场景', necessityLevel: 'low' },
      '数码产品': { scenario: 'work', description: '工作/娱乐场景', necessityLevel: 'medium' },
      '美妆护肤': { scenario: 'beauty', description: '美容场景', necessityLevel: 'medium' },
      '家用电器': { scenario: 'daily_life', description: '日常生活场景', necessityLevel: 'high' },
      '食品生鲜': { scenario: 'food', description: '美食场景', necessityLevel: 'medium' },
      '家具家居': { scenario: 'daily_life', description: '日常生活场景', necessityLevel: 'high' },
      '娱乐休闲': { scenario: 'entertainment', description: '娱乐场景', necessityLevel: 'low' },
      '图书文具': { scenario: 'education', description: '学习场景', necessityLevel: 'high' },
      '其他': { scenario: 'daily_life', description: '日常生活场景', necessityLevel: 'medium' }
    };
    
    const inferredScenario = categoryScenarioMap[category] || categoryScenarioMap['其他'];
    matchedScenarios.push(inferredScenario);
  }
  
  return {
    primaryScenario: matchedScenarios[0],
    allScenarios: matchedScenarios,
    scenarioCount: matchedScenarios.length,
    isMultiScenario: matchedScenarios.length > 1
  };
}

// 消费心理分析
function analyzeConsumptionPsychology(reason, description) {
  const fullText = (reason || '') + ' ' + (description || '');
  const textLower = fullText.toLowerCase();
  
  let emotionalState = null;
  let motivation = null;
  let riskMultiplier = 1.0;
  
  // 检测情绪状态
  for (const state of consumptionPsychology.emotional_states) {
    for (const keyword of state.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        emotionalState = {
          state: state.state,
          description: state.description,
          matchedKeyword: keyword
        };
        riskMultiplier = state.risk_multiplier;
        break;
      }
    }
    if (emotionalState) break;
  }
  
  // 检测消费动机
  for (const motiv of consumptionPsychology.motivation_types) {
    for (const keyword of motiv.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        motivation = {
          motivation: motiv.motivation,
          description: motiv.description,
          rationality: motiv.rationality,
          matchedKeyword: keyword
        };
        break;
      }
    }
    if (motivation) break;
  }
  
  // 默认值
  if (!emotionalState) {
    emotionalState = {
      state: 'neutral',
      description: '情绪状态正常',
      matchedKeyword: null
    };
  }
  
  if (!motivation) {
    motivation = {
      motivation: 'unknown',
      description: '消费动机未明确',
      rationality: 'medium',
      matchedKeyword: null
    };
  }
  
  return {
    emotionalState: emotionalState,
    motivation: motivation,
    riskMultiplier: riskMultiplier,
    rationalityLevel: motivation.rationality
  };
}

// 必需性评估
function evaluateNecessity(scenarioAnalysis, psychologyAnalysis, category) {
  const necessityLevelMap = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  const scenarioNecessity = scenarioAnalysis.primaryScenario ? 
    necessityLevelMap[scenarioAnalysis.primaryScenario.necessityLevel] : 2;
  
  const motivationRationalityMap = {
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  const motivationRationality = motivationRationalityMap[psychologyAnalysis.rationalityLevel] || 2;
  
  // 综合必需性评分（场景必需性 + 动机理性度）
  const necessityScore = (scenarioNecessity + motivationRationality) / 2;
  
  let necessityLevel = 'medium';
  if (necessityScore >= 2.5) {
    necessityLevel = 'high';
  } else if (necessityScore >= 1.5) {
    necessityLevel = 'medium';
  } else {
    necessityLevel = 'low';
  }
  
  return {
    necessityScore: necessityScore,
    necessityLevel: necessityLevel,
    scenarioContribution: scenarioNecessity,
    motivationContribution: motivationRationality,
    description: getNecessityDescription(necessityLevel)
  };
}

function getNecessityDescription(level) {
  const descriptions = {
    'high': '此商品属于高必需性消费，购买决策相对合理',
    'medium': '此商品属于中等必需性消费，建议评估实际需求',
    'low': '此商品属于低必需性消费，购买决策需谨慎'
  };
  return descriptions[level] || descriptions['medium'];
}

// 生成增强版建议
function generateEnhancedSuggestions(score, price, category, tactics, impulseScore, 
                                     priceAssessment, scenarioAnalysis, psychologyAnalysis, necessityAnalysis) {
  const suggestions = [];
  
  // 基于风险等级的建议
  if (score >= 7) {
    suggestions.push({
      priority: 'critical',
      icon: '🚨',
      title: '强烈建议放弃',
      content: '检测到极高风险因素叠加，强烈建议放弃此次购买。如确有需求，建议等待至少72小时冷静期后再重新评估。',
      action: '等待72小时冷静期'
    });
  } else if (score >= 5) {
    suggestions.push({
      priority: 'high',
      icon: '⏰',
      title: '建议观望等待',
      content: '存在较高风险，建议等待48小时冷静期。期间可以：对比同类产品价格、评估实际需求、等待促销活动。',
      action: '等待48小时冷静期'
    });
  }
  
  // 基于价格的建议
  if (priceAssessment.isHigh) {
    suggestions.push({
      priority: 'high',
      icon: '💰',
      title: '价格优化建议',
      content: `该商品价格高于此类商品平均价格约${Math.round((priceAssessment.priceRatio - 1) * 100)}%。建议：1)等待促销活动（通常能节省20%-40%）；2)选择性价比更高的替代品；3)对比多个平台价格。`,
      action: '对比价格'
    });
  }
  
  if (priceAssessment.incomeRatioWarning) {
    suggestions.push({
      priority: 'high',
      icon: '📊',
      title: '财务规划建议',
      content: `此商品价格占月收入${(priceAssessment.incomeRatio * 100).toFixed(0)}%，建议：1)评估是否影响其他必需支出；2)考虑分期付款方案；3)等待收入更充裕时购买。`,
      action: '财务规划'
    });
  }
  
  // 基于营销套路的建议
  if (tactics.length > 0) {
    const urgencyTactics = tactics.filter(t => t.category === 'urgency' || t.category === 'scarcity');
    if (urgencyTactics.length > 0) {
      suggestions.push({
        priority: 'high',
        icon: '⏱️',
        title: '破解紧迫感套路',
        content: '商家刻意制造紧迫感促使快速决策。建议：1)忽略"限时""限量"等营销词汇；2)商品通常会再次上架或促销；3)给自己24小时冷静时间。',
        action: '冷静24小时'
      });
    }
    
    const bundleTactics = tactics.filter(t => t.category === 'bundle_trap');
    if (bundleTactics.length > 0) {
      suggestions.push({
        priority: 'medium',
        icon: '📦',
        title: '避免捆绑陷阱',
        content: '检测到捆绑销售套路。建议：1)单独购买真正需要的商品；2)计算捆绑套餐的实际单价；3)评估赠品是否真的需要。',
        action: '单独购买'
      });
    }
  }
  
  // 基于冲动消费的建议
  if (impulseScore >= 4) {
    suggestions.push({
      priority: 'high',
      icon: '🧠',
      title: '冲动消费干预',
      content: '检测到明显的冲动消费倾向。建议：1)离开购物环境24小时；2)与朋友讨论购买决策；3)写下购买理由和反对理由对比。',
      action: '寻求他人意见'
    });
  }
  
  // 基于心理状态的建议
  if (psychologyAnalysis.riskMultiplier > 2) {
    suggestions.push({
      priority: 'high',
      icon: '❤️',
      title: '情绪管理建议',
      content: `当前心理状态可能影响决策理性。建议：1)先处理情绪问题再考虑购物；2)寻找其他方式缓解情绪（运动、社交等）；3)避免情绪化消费。`,
      action: '情绪管理'
    });
  }
  
  // 基于必需性的建议
  if (necessityAnalysis.necessityLevel === 'low') {
    suggestions.push({
      priority: 'medium',
      icon: '📋',
      title: '需求评估建议',
      content: '此商品属于低必需性消费。建议：1)列出实际使用场景；2)评估是否有替代方案；3)考虑购买频率和使用时长。',
      action: '需求评估'
    });
  }
  
  // 基于场景的建议
  if (scenarioAnalysis.isMultiScenario) {
    suggestions.push({
      priority: 'low',
      icon: '🎯',
      title: '场景聚焦建议',
      content: '此商品可用于多个场景。建议：明确主要使用场景，避免为次要场景支付额外费用。',
      action: '明确主要场景'
    });
  }
  
  // 通用理性消费建议
  if (score < 5) {
    suggestions.push({
      priority: 'low',
      icon: '💡',
      title: '理性消费建议',
      content: '虽然风险较低，仍建议：1)对比至少3个同类产品；2)查看用户真实评价；3)确认退换货政策。',
      action: '多方对比'
    });
  }
  
  return suggestions;
}

// 生成增强版洞察
function generateEnhancedInsights(productName, price, category, tactics, riskLevel, 
                                 priceAssessment, scenarioAnalysis, psychologyAnalysis) {
  const insights = [];
  
  // 营销套路洞察
  if (tactics.length > 0) {
    const tacticCategories = {};
    tactics.forEach(t => {
      if (!tacticCategories[t.category]) {
        tacticCategories[t.category] = [];
      }
      tacticCategories[t.category].push(t.name);
    });
    
    insights.push({
      type: 'marketing_tactics',
      icon: '🎯',
      title: '营销套路分析',
      content: `检测到${tactics.length}种营销套路，主要类型：${Object.keys(tacticCategories).join('、')}`,
      detail: tactics.map(t => `${t.name}：${t.description}`).join('\n')
    });
  }
  
  // 价格洞察
  if (priceAssessment.isHigh) {
    insights.push({
      type: 'price_insight',
      icon: '💰',
      title: '价格洞察',
      content: `价格高于同类商品平均${Math.round((priceAssessment.priceRatio - 1) * 100)}%，属于${priceAssessment.priceLevel}价格区间`,
      detail: `同类商品平均价格：¥${priceAssessment.categoryAvg}，合理价格区间：¥${priceAssessment.thresholds.low}-${priceAssessment.thresholds.high}`
    });
  }
  
  // 场景洞察
  if (scenarioAnalysis.primaryScenario) {
    insights.push({
      type: 'scenario_insight',
      icon: '🎯',
      title: '使用场景分析',
      content: `主要使用场景：${scenarioAnalysis.primaryScenario.description}`,
      detail: `必需性等级：${scenarioAnalysis.primaryScenario.necessityLevel}`
    });
  }
  
  // 心理洞察
  if (psychologyAnalysis.emotionalState && psychologyAnalysis.emotionalState.state !== 'neutral') {
    insights.push({
      type: 'psychology_insight',
      icon: '🧠',
      title: '心理状态分析',
      content: psychologyAnalysis.emotionalState.description,
      detail: `消费动机：${psychologyAnalysis.motivation.description}`
    });
  }
  
  // 决策建议洞察
  insights.push({
    type: 'decision_insight',
    icon: '💡',
    title: '决策建议',
    content: `综合评估：${riskLevel === 'low' ? '可以购买' : riskLevel === 'medium' ? '谨慎考虑' : '建议放弃'}`,
    detail: `建议：等待冷静期、对比价格、评估需求`
  });
  
  return insights;
}

// 生成决策树
function generateDecisionTree(tactics, impulseScore, priceAssessment, 
                             scenarioAnalysis, psychologyAnalysis, necessityAnalysis) {
  const nodes = [];
  
  // 根节点
  nodes.push({
    id: 'root',
    question: '是否真的需要这个商品？',
    type: 'question',
    level: 0
  });
  
  // 第一层：必需性判断
  nodes.push({
    id: 'necessity',
    question: `必需性评估：${necessityAnalysis.description}`,
    type: 'condition',
    level: 1,
    parent: 'root',
    result: necessityAnalysis.necessityLevel
  });
  
  // 第二层：价格判断
  nodes.push({
    id: 'price',
    question: `价格评估：${priceAssessment.assessment}`,
    type: 'condition',
    level: 2,
    parent: 'necessity',
    result: priceAssessment.priceLevel
  });
  
  // 第三层：营销套路判断
  if (tactics.length > 0) {
    nodes.push({
      id: 'tactics',
      question: `营销套路：检测到${tactics.length}种套路`,
      type: 'condition',
      level: 3,
      parent: 'price',
      result: tactics.length >= 3 ? 'high' : 'medium'
    });
  }
  
  // 第四层：冲动消费判断
  if (impulseScore >= 2) {
    nodes.push({
      id: 'impulse',
      question: `冲动倾向：冲动指数${impulseScore.toFixed(1)}`,
      type: 'condition',
      level: 4,
      parent: tactics.length > 0 ? 'tactics' : 'price',
      result: impulseScore >= 4 ? 'high' : 'medium'
    });
  }
  
  // 第五层：心理状态判断
  if (psychologyAnalysis.riskMultiplier > 1.5) {
    nodes.push({
      id: 'psychology',
      question: `心理状态：${psychologyAnalysis.emotionalState.description}`,
      type: 'condition',
      level: 5,
      parent: impulseScore >= 2 ? 'impulse' : (tactics.length > 0 ? 'tactics' : 'price'),
      result: psychologyAnalysis.riskMultiplier > 2 ? 'high' : 'medium'
    });
  }
  
  // 最终决策节点
  const lastNodeId = psychologyAnalysis.riskMultiplier > 1.5 ? 'psychology' : 
                    (impulseScore >= 2 ? 'impulse' : 
                    (tactics.length > 0 ? 'tactics' : 'price'));
  
  nodes.push({
    id: 'decision',
    question: '最终决策建议',
    type: 'decision',
    level: 6,
    parent: lastNodeId,
    recommendation: generateFinalRecommendation(necessityAnalysis, priceAssessment, tactics, impulseScore, psychologyAnalysis)
  });
  
  return {
    nodes: nodes,
    depth: nodes.length,
    complexity: calculateTreeComplexity(tactics, impulseScore, psychologyAnalysis)
  };
}

function generateFinalRecommendation(necessity, price, tactics, impulse, psychology) {
  let recommendation = 'accept';
  let confidence = 'high';
  
  if (necessity.necessityLevel === 'low' && price.isHigh) {
    recommendation = 'reject';
    confidence = 'high';
  } else if (tactics.length >= 3 || impulse >= 4 || psychology.riskMultiplier > 2) {
    recommendation = 'wait';
    confidence = 'medium';
  } else if (price.isHigh || tactics.length >= 1 || impulse >= 2) {
    recommendation = 'caution';
    confidence = 'medium';
  }
  
  return {
    action: recommendation,
    confidence: confidence,
    reasoning: '基于多维度综合评估'
  };
}

function calculateTreeComplexity(tactics, impulseScore, psychologyAnalysis) {
  let complexity = 1;
  
  if (tactics.length > 0) complexity += tactics.length * 0.5;
  if (impulseScore > 0) complexity += impulseScore * 0.3;
  if (psychologyAnalysis.riskMultiplier > 1) complexity += psychologyAnalysis.riskMultiplier * 0.2;
  
  return Math.min(10, complexity);
}

// 计算置信度
function calculateConfidence(detectedTactics, impulseScore, psychologyAnalysis, trapAnalysis = null) {
  let confidence = 0.7; // 基础置信度
  
  // 营销套路检测越多，置信度越高
  if (detectedTactics.length > 0) {
    confidence += detectedTactics.length * 0.05;
  }
  
  // 冲动消费指标越多，置信度越高
  if (impulseScore > 0) {
    confidence += Math.min(impulseScore * 0.03, 0.15);
  }
  
  // 心理状态明确，置信度提高
  if (psychologyAnalysis.emotionalState && psychologyAnalysis.emotionalState.state !== 'neutral') {
    confidence += 0.05;
  }
  
  // 消费陷阱检测增加置信度
  if (trapAnalysis && trapAnalysis.detectedTraps.length > 0) {
    confidence += trapAnalysis.detectedTraps.length * 0.03;
  }
  
  return Math.min(0.95, confidence);
}

// 生成个性化建议（保留原函数兼容性）
function generateSuggestions(score, price, category, tactics, impulseScore, priceAssessment) {
  const suggestions = [];
  
  if (score >= 5) {
    suggestions.push({
      priority: 'high',
      title: '替代方案',
      content: `建议搜索同类产品的历史价格，对比后再决定。可以等待促销活动期间购买，通常能节省20%-40%。`
    });
  }
  
  if (priceAssessment.isHigh) {
    suggestions.push({
      priority: 'medium',
      title: '价格建议',
      content: `该商品价格高于此类商品平均价格约${Math.round((priceAssessment.priceRatio - 1) * 100)}%。建议等待降价或选择性价比更高的替代品。`
    });
  }
  
  if (tactics.some(t => t.name.includes('限时'))) {
    suggestions.push({
      priority: 'high',
      title: '限时提醒',
      content: `所谓的"限时优惠"往往是营销手段。真正的限时特价在其他时间也会有，不必急于下单。`
    });
  }
  
  if (tactics.some(t => t.name.includes('满减'))) {
    suggestions.push({
      priority: 'medium',
      title: '满减建议',
      content: `计算实际需要购买的商品总价，如果为了凑满减而购买不需要的东西，反而得不偿失。`
    });
  }
  
  if (impulseScore >= 3) {
    suggestions.push({
      priority: 'high',
      title: '冷静建议',
      content: `将商品加入购物车，等待3-7天后再决定。如果到时候仍然觉得需要，再购买也不迟。`
    });
  }
  
  // 类别特定建议
  const categorySuggestions = {
    '服饰鞋包': '服饰类商品建议关注反季促销，可以节省30%-50%。',
    '数码产品': '数码产品更新换代快，建议等新一代产品上市后购买上一代，性价比更高。',
    '美妆护肤': '护肤品的最佳购买时机是双11、618等大促，可以关注套装中的正装比例。',
    '家用电器': '家电类建议在线下店体验后再决定购买，京东/天猫旗舰店价格更透明。',
    '食品生鲜': '食品生鲜建议按需购买，避免因促销囤货造成浪费。',
    '家具家居': '家具家居类建议多对比几家，关注评价中的实物与描述差异。',
    '娱乐休闲': '娱乐休闲类建议办理会员卡前先试用，确认自己会高频使用再办理年卡。',
    '图书文具': '图书建议使用图书馆或电子书app阅读，确实需要再购买纸质书。'
  };
  
  if (categorySuggestions[category]) {
    suggestions.push({
      priority: 'low',
      title: '购物技巧',
      content: categorySuggestions[category]
    });
  }
  
  return suggestions;
}

// 生成洞察
function generateInsights(productName, price, category, tactics, riskLevel, priceAssessment) {
  const insights = [];
  
  // 套路分析
  if (tactics.length > 0) {
    const highRiskTactics = tactics.filter(t => t.risk === 'high');
    if (highRiskTactics.length > 0) {
      insights.push({
        type: 'warning',
        title: '⚠️ 高风险营销手法',
        content: `该商品使用了「${highRiskTactics.map(t => t.name).join('」「')}」策略，${highRiskTactics[0].description}`
      });
    }
    
    const mediumRiskTactics = tactics.filter(t => t.risk === 'medium');
    if (mediumRiskTactics.length > 0) {
      insights.push({
        type: 'caution',
        title: '⚡ 中等风险提示',
        content: `检测到「${mediumRiskTactics.map(t => t.name).join('」「')}」，这些是常见的促销套路。`
      });
    }
  }
  
  // 价格分析
  if (priceAssessment.priceRatio > 1.5) {
    insights.push({
      type: 'info',
      title: '💰 价格分析',
      content: `该商品价格比同类平均高出${Math.round((priceAssessment.priceRatio - 1) * 100)}%，性价比不高。`
    });
  }
  
  // 低风险商品
  if (riskLevel === 'low' && tactics.length === 0) {
    insights.push({
      type: 'success',
      title: '✅ 理性评估',
      content: `该商品未检测到明显营销套路，价格相对合理，购买决策较为理性。`
    });
  }
  
  return insights;
}

// 生成消费习惯诊断报告
function generateDiagnosticReport(userId) {
  const userRecords = database.analysis_records.filter(r => r.user_id === userId);
  
  if (userRecords.length === 0) {
    return {
      hasData: false,
      message: '暂无足够的消费记录来进行诊断。建议先进行几次消费分析后再查看诊断报告。'
    };
  }
  
  // 时间范围分析
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const threeMonthsAgo = new Date(now - 90 * 24 * 60 * 60 * 1000);
  
  const recentRecords = userRecords.filter(r => new Date(r.created_at) >= weekAgo);
  const monthlyRecords = userRecords.filter(r => new Date(r.created_at) >= monthAgo);
  const quarterlyRecords = userRecords.filter(r => new Date(r.created_at) >= threeMonthsAgo);
  
  // 计算各项指标
  const stats = {
    totalAnalyzed: userRecords.length,
    monthlyAnalyzed: monthlyRecords.length,
    weeklyAnalyzed: recentRecords.length,
    totalSaved: userRecords.reduce((sum, r) => sum + r.saved_amount, 0),
    monthlySaved: monthlyRecords.reduce((sum, r) => sum + r.saved_amount, 0),
    rejectCount: userRecords.filter(r => r.decision === 'reject').length,
    acceptCount: userRecords.filter(r => r.decision === 'accept').length,
    rejectRate: Math.round(userRecords.filter(r => r.decision === 'reject').length / userRecords.length * 100)
  };
  
  // 风险分布
  const riskDistribution = {
    high: userRecords.filter(r => r.risk_level === 'high').length,
    medium: userRecords.filter(r => r.risk_level === 'medium').length,
    low: userRecords.filter(r => r.risk_level === 'low').length
  };
  
  // 类别分析
  const categoryAnalysis = {};
  userRecords.forEach(r => {
    if (!categoryAnalysis[r.category]) {
      categoryAnalysis[r.category] = {
        total: 0,
        saved: 0,
        rejected: 0,
        avgPrice: 0,
        totalPrice: 0
      };
    }
    categoryAnalysis[r.category].total++;
    categoryAnalysis[r.category].saved += r.saved_amount;
    if (r.decision === 'reject') categoryAnalysis[r.category].rejected++;
    categoryAnalysis[r.category].totalPrice += r.price;
  });
  
  Object.keys(categoryAnalysis).forEach(cat => {
    categoryAnalysis[cat].avgPrice = Math.round(categoryAnalysis[cat].totalPrice / categoryAnalysis[cat].total);
  });
  
  // 高风险类别TOP3
  const topRiskyCategories = Object.entries(categoryAnalysis)
    .map(([cat, data]) => ({ category: cat, ...data }))
    .sort((a, b) => (b.rejected + b.saved) - (a.rejected + a.saved))
    .slice(0, 3);
  
  // 常用套路检测
  const allTactics = userRecords.flatMap(r => r.detected_tactics);
  const tacticFrequency = {};
  allTactics.forEach(t => {
    tacticFrequency[t] = (tacticFrequency[t] || 0) + 1;
  });
  const commonTactics = Object.entries(tacticFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tactic, count]) => ({ tactic, count }));
  
  // 生成诊断结论
  const conclusions = [];
  
  // 理性指数 (0-100)
  const rationalityScore = calculateRationalityScore(stats, riskDistribution);
  
  if (rationalityScore >= 80) {
    conclusions.push({
      type: 'excellent',
      title: '🌟 优秀 - 理性消费达人',
      content: `您在近期的消费决策中表现出极高的理性程度。拒绝率${stats.rejectRate}%，累计节省¥${stats.totalSaved}，说明您能够有效识别营销套路并做出合理决策。`
    });
  } else if (rationalityScore >= 60) {
    conclusions.push({
      type: 'good',
      title: '👍 良好 - 消费理性',
      content: `您的消费决策相对理性，能够识别大部分营销套路。建议继续关注高风险商品，保持警惕。`
    });
  } else if (rationalityScore >= 40) {
    conclusions.push({
      type: 'warning',
      title: '⚠️ 需注意 - 冲动消费倾向',
      content: `您可能存在一定的冲动消费倾向。建议在购买前多思考实际需求，可以将商品加入购物车冷静几天后再决定。`
    });
  } else {
    conclusions.push({
      type: 'danger',
      title: '🚨 警惕 - 冲动消费风险高',
      content: `您的消费决策中冲动消费倾向较明显。建议建立购物规则：如非必要不购买、价格超过预算不考虑、等待24小时冷静期等。`
    });
  }
  
  // 具体问题和建议
  const issues = [];
  const recommendations = [];
  
  // 分析高频套路
  if (commonTactics.length > 0) {
    const topTactic = commonTactics[0];
    issues.push({
      title: '您最常遇到的营销套路',
      content: `「${topTactic.tactic}」出现了${topTactic.count}次，占所有检测到的套路的${Math.round(topTactic.count / allTactics.length * 100)}%。`
    });
    
    const tacticAdvice = {
      '限时抢购': '遇到限时促销时，先确认商品是否真的需要，再对比历史价格。',
      '稀缺性营销': '稀缺不等于值得，保持理性判断。',
      '满减陷阱': '计算真实需求，避免为凑单购买无用品。',
      '直播营销': '直播间的氛围容易让人冲动下单，建议先加入购物车。',
      '饥饿营销': '所谓的"限量"往往是营销手段，替代品很多。',
      '捆绑销售': '仔细计算套装中每个商品的实际价值。'
    };
    
    if (tacticAdvice[topTactic.tactic]) {
      recommendations.push({
        priority: 'high',
        content: tacticAdvice[topTactic.tactic]
      });
    }
  }
  
  // 高消费类别建议
  if (topRiskyCategories.length > 0) {
    const topCategory = topRiskyCategories[0];
    if (topCategory.rejected > 2) {
      issues.push({
        title: '「' + topCategory.category + '」是高风险消费区',
        content: `您在该类别分析了${topCategory.total}次，其中${topCategory.rejected}次选择了拒绝，说明您对该类商品的诱惑有较好的抵御能力。但仍需保持警惕。`
      });
      recommendations.push({
        priority: 'medium',
        content: `「${topCategory.category}」类商品建议设置预算上限，避免超支。`
      });
    }
  }
  
  // 省钱潜力分析
  const potentialSavings = calculatePotentialSavings(userRecords, monthlyRecords);
  if (potentialSavings > 0) {
    recommendations.push({
      priority: 'high',
      content: `如果继续保持当前的理性消费水平，预计全年可节省约¥${potentialSavings * 12}！坚持就是胜利！`
    });
  }
  
  // 消费时间分布分析
  const timeDistribution = analyzeTimeDistribution(userRecords);
  
  // 消费金额分布分析
  const amountDistribution = analyzeAmountDistribution(userRecords);
  
  // 购物频率分析
  const shoppingFrequency = analyzeShoppingFrequency(userRecords);
  
  // 品牌偏好分析
  const brandPreference = analyzeBrandPreference(userRecords);
  
  // 消费决策速度分析
  const decisionSpeed = analyzeDecisionSpeed(userRecords);

  // 冲动消费趋势分析（新增）
  const impulseTrend = analyzeImpulseTrend(userRecords);

  // 营销套路抵抗力分析（新增）
  const tacticResistance = analyzeTacticResistance(userRecords);

  // 消费决策质量分析（新增）
  const decisionQuality = analyzeDecisionQuality(userRecords);

  // 消费模式识别
  const consumptionPatterns = identifyConsumptionPatterns(userRecords, categoryAnalysis, timeDistribution);
  
  // 生成个性化行为准则
  const personalRules = generatePersonalRules(stats, commonTactics, topRiskyCategories);
  
  return {
    hasData: true,
    generatedAt: new Date().toISOString(),
    period: {
      start: threeMonthsAgo.toISOString(),
      end: now.toISOString()
    },
    overview: {
      rationalityScore,
      totalAnalyzed: stats.totalAnalyzed,
      monthlyAnalyzed: stats.monthlyAnalyzed,
      weeklyAnalyzed: stats.weeklyAnalyzed,
      totalSaved: stats.totalSaved,
      monthlySaved: stats.monthlySaved,
      rejectRate: stats.rejectRate
    },
    riskDistribution,
    categoryAnalysis,
    topRiskyCategories,
    commonTactics,
    timeDistribution,
    amountDistribution,
    shoppingFrequency,
    brandPreference,
    decisionSpeed,
    impulseTrend,
    tacticResistance,
    decisionQuality,
    consumptionPatterns,
    conclusions,
    issues,
    recommendations,
    personalRules
  };
}

// 计算理性指数
function calculateRationalityScore(stats, riskDistribution) {
  let score = 50; // 基础分
  
  // 拒绝率贡献 (0-30分)
  score += Math.min(30, stats.rejectRate * 0.6);
  
  // 风险分布贡献 (0-20分)
  const lowRiskRatio = stats.totalAnalyzed > 0 ? riskDistribution.low / stats.totalAnalyzed : 0;
  score += lowRiskRatio * 20;
  
  // 节省金额贡献 (0-10分)
  const savingsScore = Math.min(10, stats.totalSaved / 100);
  score += savingsScore;
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

// 计算潜在节省
function calculatePotentialSavings(allRecords, monthlyRecords) {
  const avgMonthlySaved = monthlyRecords.length > 0 
    ? monthlyRecords.reduce((sum, r) => sum + r.saved_amount, 0) 
    : 0;
  return avgMonthlySaved;
}

// 生成个人行为准则
function generatePersonalRules(stats, commonTactics, topCategories) {
  const rules = [];
  
  // 基础准则
  rules.push('购买前冷静24小时，确认真正需要再下单');
  rules.push('遇到促销先加入购物车，等活动结束再决定');
  rules.push('设置月度消费预算，超出预算一律不买');
  
  // 针对高频套路
  if (commonTactics.some(t => t.tactic.includes('直播'))) {
    rules.push('直播购物前先设置购物清单，不在直播间冲动下单');
  }
  if (commonTactics.some(t => t.tactic.includes('满减'))) {
    rules.push('满减凑单前先计算单个商品的实际价格');
  }
  if (commonTactics.some(t => t.tactic.includes('限时'))) {
    rules.push('限时商品不等同于划算，货比三家后再决定');
  }
  
  // 针对高频类别
  if (topCategories.length > 0) {
    const topCat = topCategories[0].category;
    const thresholds = getPriceThreshold(topCat);
    const threshold = thresholds.medium * 1.5;
    rules.push(`${topCat}类商品价格超过¥${threshold}时需要特别谨慎`);
  }
  
  return rules;
}

function getPriceThreshold(category) {
  const baseThresholds = {
    '服饰鞋包': { low: 200, medium: 800, high: 2000 },
    '数码产品': { low: 500, medium: 2000, high: 5000 },
    '美妆护肤': { low: 100, medium: 500, high: 1500 },
    '家用电器': { low: 300, medium: 1500, high: 5000 },
    '食品生鲜': { low: 50, medium: 200, high: 500 },
    '家具家居': { low: 500, medium: 2000, high: 5000 },
    '娱乐休闲': { low: 100, medium: 500, high: 1500 },
    '图书文具': { low: 50, medium: 200, high: 500 },
    '其他': { low: 200, medium: 1000, high: 3000 }
  };
  
  const sensitivityAdjustment = priceIndicatorData.sensitivityAdjustment[category] || 1.0;
  const base = baseThresholds[category] || baseThresholds['其他'];
  
  return {
    low: Math.round(base.low * sensitivityAdjustment),
    medium: Math.round(base.medium * sensitivityAdjustment),
    high: Math.round(base.high * sensitivityAdjustment),
    baseLow: base.low,
    baseMedium: base.medium,
    baseHigh: base.high,
    sensitivityAdjustment: sensitivityAdjustment
  };
}

function generateInsights(productName, price, category, tactics, riskLevel) {
  const insights = [];
  const priceThresholds = getPriceThreshold(category);
  
  if (tactics.length > 0) {
    const highRiskTactics = tactics.filter(t => t.risk === 'high');
    if (highRiskTactics.length > 0) {
      insights.push({
        type: 'warning',
        title: '高风险营销手法',
        content: `产品使用了「${highRiskTactics[0].name}」策略，${highRiskTactics[0].description}`
      });
    }
  }
  
  if (price > priceThresholds.high) {
    insights.push({
      type: 'info',
      title: '大额消费提醒',
      content: '该商品价格较高，建议对比同类产品并确认实际需求'
    });
  }
  
  if (riskLevel === 'low') {
    insights.push({
      type: 'success',
      title: '理性消费评估',
      content: '该商品未检测到明显营销套路，购买决策较为理性'
    });
  }
  
  const savingsProjection = calculateSavings(price, riskLevel);
  if (savingsProjection > 0) {
    insights.push({
      type: 'success',
      title: '潜在节省',
      content: `如果放弃此次购买，预计今年可节省约 ¥${savingsProjection}`
    });
  }
  
  return insights;
}

function calculateSavings(price, riskLevel) {
  if (riskLevel === 'high') {
    return Math.round(price * 4);
  } else if (riskLevel === 'medium') {
    return Math.round(price * 2);
  }
  return 0;
}

function calculateStreak(records) {
  if (records.length === 0) return 0;
  
  const dates = [...new Set(records.map(r => r.created_at.split('T')[0]))].sort();
  let streak = 0;
  const today = new Date();
  
  for (let i = dates.length - 1; i >= 0; i--) {
    const recordDate = new Date(dates[i]);
    const diffDays = Math.floor((today - recordDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// 价格指标分析（增强版 - 引入价格弹性和变化率分析）
function analyzePriceIndicator(productName, price, category) {
  const benchmarks = industryBenchmarks[category];
  if (!benchmarks) {
    return { hasData: false, description: '暂无该类别价格指标数据' };
  }

  const { priceDistribution } = benchmarks;
  let priceTier = 'unknown';
  let pricePosition = 0;

  if (price <= priceDistribution.budget.max) {
    priceTier = 'budget';
    pricePosition = price / priceDistribution.budget.max;
  } else if (price <= priceDistribution.midRange.max) {
    priceTier = 'midRange';
    pricePosition = (price - priceDistribution.midRange.min) / (priceDistribution.midRange.max - priceDistribution.midRange.min);
  } else if (price <= priceDistribution.premium.max) {
    priceTier = 'premium';
    pricePosition = (price - priceDistribution.premium.min) / (priceDistribution.premium.max - priceDistribution.premium.min);
  } else {
    priceTier = 'luxury';
    pricePosition = 1;
  }

  const midRangeAvg = (priceDistribution.midRange.min + priceDistribution.midRange.max) / 2;
  const priceDeviation = ((price - midRangeAvg) / midRangeAvg) * 100;

  const sensitivity = priceIndicatorData.priceSensitivity[category] || 0.7;
  const volatility = priceIndicatorData.priceVolatility[category] || 0.5;
  const elasticity = priceIndicatorData.priceElasticity[category] || 1.0;

  let deviationLevel = 'normal';
  let deviationDescription = '';

  const sensitivityAdjustedThreshold = 20 * (1 - sensitivity * 0.3);
  const elasticityAdjustedThreshold = 50 * (1 - (elasticity - 1) * 0.1);

  if (priceDeviation > elasticityAdjustedThreshold) {
    deviationLevel = 'very_high';
    deviationDescription = `价格比市场中位数高${Math.round(priceDeviation)}%，处于高端区间`;
  } else if (priceDeviation > sensitivityAdjustedThreshold) {
    deviationLevel = 'high';
    deviationDescription = `价格比市场中位数高${Math.round(priceDeviation)}%，略高于平均水平`;
  } else if (priceDeviation < -30) {
    deviationLevel = 'very_low';
    deviationDescription = `价格比市场中位数低${Math.round(Math.abs(priceDeviation))}%，需关注产品质量`;
  } else if (priceDeviation < -10) {
    deviationLevel = 'low';
    deviationDescription = `价格比市场中位数低${Math.round(Math.abs(priceDeviation))}%，性价比相对较高`;
  } else {
    deviationLevel = 'normal';
    deviationDescription = '价格处于市场正常区间';
  }

  const priceChangeRate = calculatePriceChangeRate(category, price, midRangeAvg, volatility);
  const elasticityImpact = calculateElasticityImpact(elasticity, priceDeviation);

  let priceIndicatorScore = 0;
  if (deviationLevel === 'very_high') {
    priceIndicatorScore = 1.5 * elasticity;
  } else if (deviationLevel === 'high') {
    priceIndicatorScore = 0.8 * elasticity;
  } else if (deviationLevel === 'very_low') {
    priceIndicatorScore = 1.0;
  }
  
  priceIndicatorScore *= (1 + priceChangeRate * 0.1);

  return {
    hasData: true,
    priceTier,
    pricePosition: Math.round(pricePosition * 100) / 100,
    priceDeviation: Math.round(priceDeviation),
    deviationLevel,
    deviationDescription,
    sensitivity,
    volatility,
    elasticity,
    elasticityImpact,
    priceChangeRate,
    priceIndicatorScore: Math.min(priceIndicatorScore, 2),
    description: `${deviationDescription}。该类别价格敏感度${sensitivity > 0.7 ? '较高' : '较低'}，价格弹性${elasticity > 1.5 ? '较大' : elasticity < 0.8 ? '较小' : '适中'}，价格波动${volatility > 0.6 ? '较大' : '较小'}`
  };
}

function calculatePriceChangeRate(category, currentPrice, avgPrice, volatility) {
  const monthlyChange = volatility * (Math.random() * 0.2 - 0.1);
  const seasonalAdjustment = volatility * 0.15;
  
  const now = new Date();
  const month = now.getMonth() + 1;
  
  if ((category === '服饰鞋包' && (month === 11 || month === 12 || month === 6)) ||
      (category === '数码产品' && (month === 6 || month === 11)) ||
      (category === '美妆护肤' && (month === 11 || month === 12))) {
    return -Math.abs(monthlyChange) - seasonalAdjustment;
  } else if ((category === '服饰鞋包' && (month === 3 || month === 4)) ||
             (category === '家电' && month === 2)) {
    return monthlyChange + seasonalAdjustment * 0.5;
  }
  
  return monthlyChange;
}

function calculateElasticityImpact(elasticity, priceDeviation) {
  if (priceDeviation > 0) {
    return elasticity * (priceDeviation / 100);
  }
  return -elasticity * (priceDeviation / 100);
}

// 行业情况分析（新增）
function analyzeIndustrySituation(category) {
  const benchmarks = industryBenchmarks[category];
  if (!benchmarks) {
    return { hasData: false, description: '暂无该类别行业数据' };
  }

  const now = new Date();
  const currentMonth = (now.getMonth() + 1) + '月';
  const isPeakSeason = benchmarks.seasonalPatterns.peak.includes(currentMonth);
  const isLowSeason = benchmarks.seasonalPatterns.low.includes(currentMonth);

  let seasonStatus = 'normal';
  let seasonDescription = '';

  if (isPeakSeason) {
    seasonStatus = 'peak';
    seasonDescription = `当前${currentMonth}是该类别的销售旺季`;
  } else if (isLowSeason) {
    seasonStatus = 'low';
    seasonDescription = `当前${currentMonth}是该类别的销售淡季`;
  } else {
    seasonStatus = 'normal';
    seasonDescription = `当前${currentMonth}销售情况平稳`;
  }

  const upcomingPromotions = [];
  for (const [promo, info] of Object.entries(priceIndicatorData.discountSeasonality)) {
    if (info.categories.includes(category) || info.categories.includes('全部')) {
      upcomingPromotions.push({
        name: promo,
        discountRate: Math.round(info.discountRate * 100),
        categories: info.categories
      });
    }
  }

  let competitiveLevel = 'medium';
  let competitiveDescription = '';

  if (benchmarks.competitiveIntensity === '极高') {
    competitiveLevel = 'very_high';
    competitiveDescription = '该类别竞争极其激烈，选择空间大';
  } else if (benchmarks.competitiveIntensity === '高') {
    competitiveLevel = 'high';
    competitiveDescription = '该类别竞争较激烈，建议货比三家';
  } else if (benchmarks.competitiveIntensity === '中') {
    competitiveLevel = 'medium';
    competitiveDescription = '该类别竞争适中';
  } else {
    competitiveLevel = 'low';
    competitiveDescription = '该类别竞争较少，选择有限';
  }

  return {
    hasData: true,
    marketSize: benchmarks.marketSize,
    growthRate: Math.round(benchmarks.growthRate * 100),
    brandConcentration: benchmarks.brandConcentration,
    competitiveIntensity: benchmarks.competitiveIntensity,
    seasonStatus,
    seasonDescription,
    competitiveLevel,
    competitiveDescription,
    upcomingPromotions,
    description: `${seasonDescription}。${competitiveDescription}。市场规模${benchmarks.marketSize}，增长率${Math.round(benchmarks.growthRate * 100)}%`
  };
}

// 竞品对比分析（新增）
function analyzeCompetitors(productName, price, category) {
  const competitorData = competitorDatabase[category];
  if (!competitorData) {
    return { hasData: false, description: '暂无该类别竞品数据' };
  }

  const productNameLower = productName.toLowerCase();
  let matchedProductType = null;
  let matchedCompetitors = [];

  for (const competitor of competitorData.competitors) {
    if (productNameLower.includes(competitor.productType.toLowerCase())) {
      matchedProductType = competitor.productType;
      matchedCompetitors = competitor;
      break;
    }
  }

  if (!matchedProductType) {
    return { hasData: false, description: '未能识别具体产品类型，无法进行竞品对比' };
  }

  const { brands, avgPrice } = matchedCompetitors;

  let priceComparison = [];
  for (const brand of brands) {
    let priceLevel = 'unknown';
    let priceDiff = 0;

    if (price <= avgPrice.budget) {
      priceLevel = 'budget';
      priceDiff = ((price - avgPrice.budget) / avgPrice.budget) * 100;
    } else if (price <= avgPrice.midRange) {
      priceLevel = 'midRange';
      priceDiff = ((price - avgPrice.midRange) / avgPrice.midRange) * 100;
    } else if (price <= avgPrice.premium) {
      priceLevel = 'premium';
      priceDiff = ((price - avgPrice.premium) / avgPrice.premium) * 100;
    } else {
      priceLevel = 'luxury';
      priceDiff = ((price - avgPrice.premium) / avgPrice.premium) * 100;
    }

    priceComparison.push({
      brand,
      avgPrice: { budget: avgPrice.budget, midRange: avgPrice.midRange, premium: avgPrice.premium },
      priceLevel,
      priceDiff: Math.round(priceDiff)
    });
  }

  const midRangeAvg = avgPrice.midRange;
  const priceToMidRangeRatio = price / midRangeAvg;

  let comparisonResult = 'normal';
  let comparisonDescription = '';

  if (priceToMidRangeRatio > 2) {
    comparisonResult = 'overpriced';
    comparisonDescription = `价格是同类中端产品的${priceToMidRangeRatio.toFixed(1)}倍，价格偏高`;
  } else if (priceToMidRangeRatio > 1.3) {
    comparisonResult = 'slightly_overpriced';
    comparisonDescription = `价格比同类中端产品高${Math.round((priceToMidRangeRatio - 1) * 100)}%`;
  } else if (priceToMidRangeRatio < 0.7) {
    comparisonResult = 'good_value';
    comparisonDescription = `价格比同类中端产品低${Math.round((1 - priceToMidRangeRatio) * 100)}%，性价比不错`;
  } else if (priceToMidRangeRatio < 0.5) {
    comparisonResult = 'very_good_value';
    comparisonDescription = `价格是同类中端产品的${priceToMidRangeRatio.toFixed(1)}倍，性价比很高`;
  } else {
    comparisonResult = 'normal';
    comparisonDescription = '价格处于同类产品正常区间';
  }

  const budgetOptions = priceComparison.filter(c => c.priceLevel === 'budget' || price <= c.avgPrice.budget);
  const alternativeOptions = budgetOptions.map(c => ({
    brand: c.brand,
    expectedPrice: c.avgPrice.budget,
    savings: Math.round(price - c.avgPrice.budget)
  })).filter(o => o.savings > 0);

  return {
    hasData: true,
    productType: matchedProductType,
    categoryCompetitors: competitorData.productTypes,
    matchedCompetitors: priceComparison,
    comparisonResult,
    comparisonDescription,
    priceToMidRangeRatio: Math.round(priceToMidRangeRatio * 100) / 100,
    alternativeOptions,
    description: `${comparisonDescription}。同类竞品包括：${brands.join('、')}`
  };
}

// 品牌溢价分析
function analyzeBrandPremium(productName, category, price) {
  const brandData = brandPremiumData[category];
  if (!brandData) {
    return { hasBrand: false, brandType: 'unknown', premiumScore: 0, description: '无法识别品牌' };
  }

  const productNameUpper = productName.toUpperCase();
  let detectedBrand = null;
  let brandType = 'unknown';

  for (const brand of brandData.luxuryBrands) {
    if (productNameUpper.includes(brand.toUpperCase())) {
      detectedBrand = brand;
      brandType = 'luxury';
      break;
    }
  }

  if (!detectedBrand) {
    for (const brand of brandData.premiumBrands) {
      if (productNameUpper.includes(brand.toUpperCase())) {
        detectedBrand = brand;
        brandType = 'premium';
        break;
      }
    }
  }

  if (!detectedBrand) {
    for (const brand of brandData.budgetBrands) {
      if (productName.includes(brand)) {
        detectedBrand = brand;
        brandType = 'budget';
        break;
      }
    }
  }

  let premiumScore = 0;
  let description = '';

  if (detectedBrand) {
    const thresholds = getPriceThreshold(category);
    
    if (brandType === 'luxury') {
      premiumScore = 1.5;
      description = `检测到奢侈品牌「${detectedBrand}」，可能存在较高品牌溢价`;
      if (price > thresholds.high * 1.5) {
        premiumScore += 1.0;
        description += '，价格明显高于同类产品';
      }
    } else if (brandType === 'premium') {
      premiumScore = 0.8;
      description = `检测到高端品牌「${detectedBrand}」，存在一定品牌溢价`;
    } else if (brandType === 'budget') {
      premiumScore = -0.5;
      description = `检测到平价品牌「${detectedBrand}」，性价比相对较高`;
    }
  }

  return {
    hasBrand: detectedBrand !== null,
    detectedBrand: detectedBrand,
    brandType: brandType,
    premiumScore: premiumScore,
    description: description || '未检测到明显品牌'
  };
}

// 社交影响分析
function analyzeSocialInfluence(reason, description, productName) {
  const fullText = (reason || '') + ' ' + (description || '') + ' ' + (productName || '');
  const textLower = fullText.toLowerCase();

  let influenceScore = 0;
  const detectedInfluences = [];

  for (const influence of socialInfluenceKeywords) {
    for (const keyword of influence.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        influenceScore += influence.weight;
        detectedInfluences.push({
          type: influence.type,
          description: influence.description,
          weight: influence.weight,
          matchedKeyword: keyword
        });
        break;
      }
    }
  }

  let influenceLevel = 'none';
  let summary = '未检测到明显社交影响';

  if (influenceScore >= 4) {
    influenceLevel = 'high';
    summary = '检测到强烈的社交影响，可能影响消费决策的理性';
  } else if (influenceScore >= 2) {
    influenceLevel = 'medium';
    summary = '检测到一定的社交影响，建议保持独立判断';
  } else if (influenceScore > 0) {
    influenceLevel = 'low';
    summary = '存在轻微的社交影响';
  }

  return {
    influenceScore: influenceScore,
    influenceLevel: influenceLevel,
    detectedInfluences: detectedInfluences,
    summary: summary
  };
}

// 决策疲劳检测
function detectDecisionFatigue(reason, description) {
  const fullText = (reason || '') + ' ' + (description || '');
  const textLower = fullText.toLowerCase();

  let fatigueScore = 0;
  const detectedFatigue = [];

  for (const indicator of decisionFatigueIndicators) {
    for (const keyword of indicator.keywords) {
      if (textLower.includes(keyword)) {
        fatigueScore += indicator.weight;
        detectedFatigue.push({
          type: indicator.type,
          weight: indicator.weight,
          matchedKeyword: keyword
        });
        break;
      }
    }
  }

  let fatigueLevel = 'none';
  let advice = '';

  if (fatigueScore >= 5) {
    fatigueLevel = 'high';
    advice = '检测到明显的决策疲劳，建议暂停决策，休息后再考虑';
  } else if (fatigueScore >= 3) {
    fatigueLevel = 'medium';
    advice = '存在一定的决策疲劳，建议简化选择或寻求他人意见';
  } else if (fatigueScore > 0) {
    fatigueLevel = 'low';
    advice = '建议保持冷静，避免仓促决策';
  }

  return {
    fatigueScore: fatigueScore,
    fatigueLevel: fatigueLevel,
    detectedFatigue: detectedFatigue,
    advice: advice || '决策状态良好'
  };
}

// 购买频率分析
function analyzePurchaseFrequency(userHistory, category, productName) {
  if (!userHistory || userHistory.length === 0) {
    return { hasHistory: false, frequency: 'unknown', recentPurchases: 0, description: '暂无购买历史数据' };
  }

  const categoryRecords = userHistory.filter(r => r.category === category);
  const recentDays = 30;
  const recentCutoff = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000);
  const recentCategoryRecords = categoryRecords.filter(r => new Date(r.created_at) >= recentCutoff);

  const frequency = recentCategoryRecords.length;
  let frequencyLevel = 'normal';
  let description = '';

  if (frequency === 0) {
    frequencyLevel = 'none';
    description = '近期该类别暂无购买记录';
  } else if (frequency >= 5) {
    frequencyLevel = 'high';
    description = `近期${recentDays}天内在该类别已有${frequency}次购买，购买频率较高`;
  } else if (frequency >= 3) {
    frequencyLevel = 'medium';
    description = `近期${recentDays}天内在该类别已有${frequency}次购买`;
  } else {
    frequencyLevel = 'low';
    description = `近期${recentDays}天内在该类别有${frequency}次购买，属于正常频率`;
  }

  return {
    hasHistory: true,
    frequency: frequencyLevel,
    recentPurchases: frequency,
    totalCategoryPurchases: categoryRecords.length,
    description: description
  };
}

// 价格历史对比分析
function analyzePriceHistory(userHistory, category, currentPrice) {
  if (!userHistory || userHistory.length === 0) {
    return { hasHistory: false, avgPrice: null, minPrice: null, maxPrice: null, trend: 'unknown', comparison: 'unknown' };
  }

  const categoryRecords = userHistory.filter(r => r.category === category);
  if (categoryRecords.length === 0) {
    return { hasHistory: false, avgPrice: null, minPrice: null, maxPrice: null, trend: 'unknown', comparison: 'unknown' };
  }

  const prices = categoryRecords.map(r => r.price);
  const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  let comparison = 'same';
  let trend = 'stable';

  if (currentPrice > avgPrice * 1.2) {
    comparison = 'higher';
  } else if (currentPrice < avgPrice * 0.8) {
    comparison = 'lower';
  }

  const recentPrices = categoryRecords.slice(-5).map(r => r.price);
  if (recentPrices.length >= 3) {
    const priceChange = recentPrices[recentPrices.length - 1] - recentPrices[0];
    if (priceChange > avgPrice * 0.1) {
      trend = 'rising';
    } else if (priceChange < -avgPrice * 0.1) {
      trend = 'falling';
    }
  }

  return {
    hasHistory: true,
    avgPrice: avgPrice,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sampleSize: prices.length,
    trend: trend,
    comparison: comparison,
    description: generatePriceHistoryDescription(currentPrice, avgPrice, trend, comparison)
  };
}

function generatePriceHistoryDescription(currentPrice, avgPrice, trend, comparison) {
  const diffPercent = Math.round(Math.abs(currentPrice - avgPrice) / avgPrice * 100);
  
  let description = `当前价格¥${currentPrice}，该类别历史平均价格¥${avgPrice}`;
  
  if (comparison === 'higher') {
    description += `，比历史平均高${diffPercent}%`;
  } else if (comparison === 'lower') {
    description += `，比历史平均低${diffPercent}%`;
  }
  
  if (trend === 'rising') {
    description += '，近期价格呈上升趋势';
  } else if (trend === 'falling') {
    description += '，近期价格呈下降趋势';
  } else {
    description += '，价格走势平稳';
  }
  
  return description;
}

// 生成替代品建议
function generateSubstituteSuggestions(category, brandAnalysis) {
  const templates = substituteTemplates[category] || substituteTemplates['其他'];
  const suggestions = [];

  for (const template of templates) {
    suggestions.push({
      title: '替代品建议',
      content: template,
      priority: 'medium'
    });
  }

  if (brandAnalysis.hasBrand && brandAnalysis.brandType === 'luxury') {
    suggestions.unshift({
      title: '品牌溢价优化建议',
      content: `检测到奢侈品牌「${brandAnalysis.detectedBrand}」，建议考虑同等功能的平价替代品，可节省50%以上开支`,
      priority: 'high'
    });
  }

  return suggestions.slice(0, 3);
}

// 消费时间分布分析
function analyzeTimeDistribution(userRecords) {
  const hourlyDistribution = new Array(24).fill(0);
  const dayDistribution = new Array(7).fill(0);
  const weekDayDistribution = { workday: 0, weekend: 0 };

  userRecords.forEach(record => {
    const date = new Date(record.created_at);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    hourlyDistribution[hour]++;
    dayDistribution[dayOfWeek]++;
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekDayDistribution.workday++;
    } else {
      weekDayDistribution.weekend++;
    }
  });

  const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
  const peakDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dayDistribution.indexOf(Math.max(...dayDistribution))];

  return {
    hourlyDistribution,
    dayDistribution: dayDistribution.map((count, idx) => ({ day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][idx], count })),
    weekDayDistribution,
    peakHour,
    peakDay,
    description: `您的消费高峰时段是${peakHour}:00，消费高峰日是${peakDay}`
  };
}

// 消费金额分布分析
function analyzeAmountDistribution(userRecords) {
  const amounts = userRecords.map(r => r.price);
  if (amounts.length === 0) return { ranges: [], avgAmount: 0, maxAmount: 0, minAmount: 0 };

  const avgAmount = Math.round(amounts.reduce((sum, a) => sum + a, 0) / amounts.length);
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);

  const ranges = {
    '0-100': 0,
    '100-500': 0,
    '500-1000': 0,
    '1000-3000': 0,
    '3000+': 0
  };

  amounts.forEach(amount => {
    if (amount < 100) ranges['0-100']++;
    else if (amount < 500) ranges['100-500']++;
    else if (amount < 1000) ranges['500-1000']++;
    else if (amount < 3000) ranges['1000-3000']++;
    else ranges['3000+']++;
  });

  const dominantRange = Object.entries(ranges).sort((a, b) => b[1] - a[1])[0][0];

  return {
    ranges,
    avgAmount,
    maxAmount,
    minAmount,
    dominantRange,
    description: `您的平均消费金额为¥${avgAmount}，主要消费区间是${dominantRange}`
  };
}

// 购物频率分析
function analyzeShoppingFrequency(userRecords) {
  if (userRecords.length === 0) return { frequency: 'unknown', avgDaysBetween: null, pattern: 'unknown' };

  const dates = [...new Set(userRecords.map(r => r.created_at.split('T')[0]))].sort();
  const totalDays = (new Date(dates[dates.length - 1]) - new Date(dates[0])) / (1000 * 60 * 60 * 24);
  const avgDaysBetween = totalDays > 0 ? Math.round(totalDays / (dates.length - 1)) : 0;

  let frequency = 'low';
  let pattern = 'irregular';

  if (avgDaysBetween <= 2) {
    frequency = 'high';
    pattern = 'daily';
  } else if (avgDaysBetween <= 7) {
    frequency = 'medium';
    pattern = 'weekly';
  } else if (avgDaysBetween <= 14) {
    frequency = 'low';
    pattern = 'biweekly';
  } else {
    frequency = 'very-low';
    pattern = 'monthly';
  }

  return {
    frequency,
    avgDaysBetween,
    pattern,
    analysisDays: dates.length,
    description: `您的平均购物间隔为${avgDaysBetween}天，属于${frequency}频率购物者`
  };
}

// 品牌偏好分析
function analyzeBrandPreference(userRecords) {
  const brandCounts = {};

  userRecords.forEach(record => {
    const productName = record.product_name.toUpperCase();
    
    for (const category of Object.keys(brandPremiumData)) {
      for (const brand of [...brandPremiumData[category].luxuryBrands, ...brandPremiumData[category].premiumBrands, ...brandPremiumData[category].budgetBrands]) {
        if (productName.includes(brand.toUpperCase())) {
          brandCounts[brand] = (brandCounts[brand] || 0) + 1;
          break;
        }
      }
    }
  });

  const sortedBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
  const topBrands = sortedBrands.slice(0, 3).map(([brand, count]) => ({ brand, count }));

  let luxuryCount = 0;
  let premiumCount = 0;
  let budgetCount = 0;

  for (const [brand, count] of sortedBrands) {
    let found = false;
    for (const category of Object.keys(brandPremiumData)) {
      if (brandPremiumData[category].luxuryBrands.includes(brand)) {
        luxuryCount += count;
        found = true;
        break;
      }
      if (brandPremiumData[category].premiumBrands.includes(brand)) {
        premiumCount += count;
        found = true;
        break;
      }
      if (brandPremiumData[category].budgetBrands.includes(brand)) {
        budgetCount += count;
        found = true;
        break;
      }
    }
    if (!found) budgetCount += count;
  }

  let preferenceType = 'mixed';
  const total = luxuryCount + premiumCount + budgetCount;
  
  if (total > 0) {
    if (luxuryCount / total > 0.5) preferenceType = 'luxury';
    else if (premiumCount / total > 0.5) preferenceType = 'premium';
    else if (budgetCount / total > 0.7) preferenceType = 'budget';
  }

  return {
    topBrands,
    brandDistribution: { luxury: luxuryCount, premium: premiumCount, budget: budgetCount },
    preferenceType,
    description: generateBrandPreferenceDescription(preferenceType, topBrands)
  };
}

function generateBrandPreferenceDescription(type, topBrands) {
  let description = '';
  
  switch (type) {
    case 'luxury':
      description = '您倾向于购买奢侈品牌商品，可能存在较高的品牌溢价支出';
      break;
    case 'premium':
      description = '您偏好高端品牌，注重品质但不过度追求奢侈';
      break;
    case 'budget':
      description = '您倾向于选择平价品牌，性价比意识较强';
      break;
    default:
      description = '您的品牌选择较为多样化';
  }

  if (topBrands.length > 0) {
    description += `。您最常购买的品牌是「${topBrands[0].brand}」`;
  }

  return description;
}

// 消费决策速度分析
function analyzeDecisionSpeed(userRecords) {
  const decisions = userRecords.map(r => r.decision);
  
  const quickAccept = userRecords.filter(r => r.decision === 'accept' && r.risk_level === 'low').length;
  const carefulReject = userRecords.filter(r => r.decision === 'reject' && r.risk_level === 'high').length;
  const impulsiveAccept = userRecords.filter(r => r.decision === 'accept' && (r.risk_level === 'high' || r.risk_level === 'very-high')).length;
  const hesitant = userRecords.filter(r => r.decision === 'wait' || r.decision === 'caution').length;

  const total = userRecords.length;
  const carefulRate = total > 0 ? Math.round((quickAccept + carefulReject) / total * 100) : 0;
  const impulsiveRate = total > 0 ? Math.round(impulsiveAccept / total * 100) : 0;

  let speedType = 'balanced';
  if (carefulRate >= 70) speedType = 'careful';
  else if (impulsiveRate >= 30) speedType = 'impulsive';
  else if (hesitant >= total * 0.3) speedType = 'hesitant';

  return {
    carefulRate,
    impulsiveRate,
    hesitantCount: hesitant,
    speedType,
    description: generateDecisionSpeedDescription(speedType, carefulRate, impulsiveRate)
  };
}

function generateDecisionSpeedDescription(type, carefulRate, impulsiveRate) {
  switch (type) {
    case 'careful':
      return `您的决策风格较为谨慎（谨慎率${carefulRate}%），能够有效避免冲动消费`;
    case 'impulsive':
      return `您的决策风格偏冲动（冲动率${impulsiveRate}%），建议加强自我约束，设置冷静期`;
    case 'hesitant':
      return '您在消费决策中较为犹豫，建议明确购买标准，简化决策过程';
    default:
      return `您的决策风格较为平衡（谨慎率${carefulRate}%，冲动率${impulsiveRate}%）`;
  }
}

// 消费陷阱识别
function identifyConsumptionTraps(productName, description, reason) {
  const fullText = productName + ' ' + (description || '') + ' ' + (reason || '');
  const textLower = fullText.toLowerCase();
  
  const detectedTraps = [];
  let trapRiskScore = 0;
  
  for (const trap of consumptionTraps) {
    for (const keyword of trap.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        detectedTraps.push({
          name: trap.name,
          risk: trap.risk,
          description: trap.description,
          category: trap.category,
          matchedKeyword: keyword
        });
        
        const riskWeight = trap.risk === 'high' ? 2.0 : trap.risk === 'medium' ? 1.0 : 0.5;
        trapRiskScore += riskWeight;
        break;
      }
    }
  }
  
  let trapLevel = 'none';
  let summary = '未检测到消费陷阱';
  
  if (trapRiskScore >= 4) {
    trapLevel = 'high';
    summary = '检测到高风险消费陷阱，强烈建议放弃购买';
  } else if (trapRiskScore >= 2) {
    trapLevel = 'medium';
    summary = '检测到消费陷阱，建议谨慎对待';
  } else if (trapRiskScore > 0) {
    trapLevel = 'low';
    summary = '存在轻微的消费陷阱风险';
  }
  
  return {
    detectedTraps,
    trapRiskScore,
    trapLevel,
    summary
  };
}

// 后悔指数评估
function calculateRegretIndex(productName, description, reason, category) {
  const fullText = productName + ' ' + (description || '') + ' ' + (reason || '');
  const textLower = fullText.toLowerCase();
  
  let regretScore = 0;
  const contributingFactors = [];
  
  for (const factor of regretFactors) {
    for (const keyword of factor.keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        regretScore += factor.weight;
        contributingFactors.push({
          keyword: keyword,
          weight: factor.weight,
          reason: factor.reason
        });
        break;
      }
    }
  }
  
  // 类别修正
  const categoryRegretMultiplier = {
    '娱乐休闲': 1.3,
    '服饰鞋包': 1.2,
    '美妆护肤': 1.1,
    '数码产品': 0.9,
    '家用电器': 0.7,
    '食品生鲜': 0.6,
    '家具家居': 0.8,
    '图书文具': 0.5
  };
  
  const multiplier = categoryRegretMultiplier[category] || 1.0;
  regretScore = Math.round(regretScore * multiplier * 10) / 10;
  
  let regretLevel = 'low';
  let advice = '';
  
  if (regretScore >= 3) {
    regretLevel = 'high';
    advice = '购买后很可能后悔，建议放弃或等待更长冷静期';
  } else if (regretScore >= 1.5) {
    regretLevel = 'medium';
    advice = '有一定后悔可能性，建议谨慎考虑';
  } else if (regretScore > 0) {
    regretLevel = 'low';
    advice = '后悔可能性较低，但仍建议理性评估';
  } else {
    regretLevel = 'none';
    advice = '后悔可能性极低，购买决策较为理性';
  }
  
  return {
    regretScore,
    regretLevel,
    contributingFactors,
    advice,
    multiplier,
    description: `后悔指数：${regretScore}/5，${advice}`
  };
}

// 价格波动预测
function predictPriceMovement(category, currentPrice) {
  const pattern = pricePatterns[category] || { seasonal_drop: [], new_release_drop: 15, avg_discount_rate: 0.2 };
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStr = `${currentMonth}月`;
  
  let willDrop = false;
  let dropProbability = 0;
  let expectedDropAmount = 0;
  let bestTimeToBuy = '';
  
  // 季节性降价预测
  if (pattern.seasonal_drop.includes(currentMonthStr)) {
    willDrop = true;
    dropProbability += 0.6;
    expectedDropAmount += currentPrice * pattern.avg_discount_rate;
    bestTimeToBuy = '当前正处于降价季节';
  } else {
    // 预测下一个降价季节
    for (const month of pattern.seasonal_drop) {
      const monthNum = parseInt(month);
      if (monthNum > currentMonth) {
        const monthsAway = monthNum - currentMonth;
        willDrop = true;
        dropProbability += 0.4;
        expectedDropAmount += currentPrice * pattern.avg_discount_rate * 0.7;
        bestTimeToBuy = `${month}左右是最佳购买时机`;
        break;
      }
    }
  }
  
  // 新品发布降价预测
  if (currentPrice > getPriceThreshold(category).medium) {
    dropProbability += 0.2;
    expectedDropAmount += currentPrice * (pattern.new_release_drop / 100) * 0.5;
    if (!bestTimeToBuy) {
      bestTimeToBuy = '新品发布后可能会有降价';
    }
  }
  
  expectedDropAmount = Math.round(expectedDropAmount);
  
  let recommendation = '可以购买';
  if (dropProbability >= 0.7) {
    recommendation = '建议等待降价';
  } else if (dropProbability >= 0.4) {
    recommendation = '可考虑等待';
  }
  
  return {
    willDrop,
    dropProbability: Math.round(dropProbability * 100),
    expectedDropAmount,
    expectedDropPercent: expectedDropAmount > 0 ? Math.round(expectedDropAmount / currentPrice * 100) : 0,
    bestTimeToBuy: bestTimeToBuy || '暂无明确降价预测',
    recommendation,
    description: generatePricePredictionDescription(dropProbability, expectedDropAmount, currentPrice, bestTimeToBuy)
  };
}

function generatePricePredictionDescription(probability, dropAmount, currentPrice, bestTime) {
  if (probability >= 70) {
    return `价格下降概率${probability}%，预计可节省¥${dropAmount}（约${Math.round(dropAmount / currentPrice * 100)}%），${bestTime}`;
  } else if (probability >= 40) {
    return `价格下降概率${probability}%，预计可能节省¥${dropAmount}，${bestTime}`;
  }
  return `价格下降概率${probability}%，当前购买较为合适`;
}

// 价格变化趋势分析（增强版）
function analyzePriceTrend(productName, price, category) {
  const sensitivity = priceIndicatorData.priceSensitivity[category] || 0.7;
  const volatility = priceIndicatorData.priceVolatility[category] || 0.5;
  const elasticity = priceIndicatorData.priceElasticity[category] || 1.0;
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  
  const priceHistory = generatePriceHistory(category, price, volatility);
  const trendAnalysis = analyzeTrend(priceHistory);
  
  const seasonalImpact = calculateSeasonalImpact(category, currentMonth);
  const promotionImpact = calculatePromotionImpact(category, currentMonth);
  
  const expectedChange = trendAnalysis.slope * 3 + seasonalImpact + promotionImpact;
  const expectedPrice = price * (1 + expectedChange);
  
  const priceChangeRisk = calculatePriceChangeRisk(expectedChange, sensitivity, elasticity);
  
  const bestBuyWindow = determineBestBuyWindow(category, currentMonth, trendAnalysis, expectedChange);
  
  const recommendation = generatePriceTrendRecommendation(priceChangeRisk, expectedChange, bestBuyWindow);
  
  return {
    hasData: true,
    sensitivity,
    volatility,
    elasticity,
    currentPrice: price,
    priceHistory,
    trendAnalysis,
    seasonalImpact: Math.round(seasonalImpact * 100),
    promotionImpact: Math.round(promotionImpact * 100),
    expectedChange: Math.round(expectedChange * 100),
    expectedPrice: Math.round(expectedPrice),
    priceChangeRisk,
    bestBuyWindow,
    recommendation,
    description: `当前价格趋势${trendAnalysis.direction}，${trendAnalysis.magnitude}。预计未来3个月价格${expectedChange > 0 ? '上涨' : '下降'}${Math.abs(Math.round(expectedChange * 100))}%。${recommendation}`
  };
}

function generatePriceHistory(category, currentPrice, volatility) {
  const history = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const baseChange = (Math.random() - 0.5) * volatility * 0.2;
    const seasonalFactor = getSeasonalFactor(category, date.getMonth() + 1);
    
    const price = currentPrice * (1 + baseChange + seasonalFactor);
    history.push({
      month: monthStr,
      price: Math.round(price),
      change: Math.round((price - currentPrice) / currentPrice * 100)
    });
  }
  
  return history;
}

function getSeasonalFactor(category, month) {
  const seasonalPatterns = {
    '服饰鞋包': { peak: [11, 12, 6], low: [3, 4], peakFactor: 0.15, lowFactor: -0.1 },
    '数码产品': { peak: [6, 11], low: [2, 3], peakFactor: 0.1, lowFactor: -0.08 },
    '美妆护肤': { peak: [11, 12], low: [3, 4], peakFactor: 0.12, lowFactor: -0.06 },
    '家用电器': { peak: [6, 11], low: [2], peakFactor: 0.1, lowFactor: -0.05 },
    '食品生鲜': { peak: [1, 12], low: [8], peakFactor: 0.08, lowFactor: -0.03 },
    '家具家居': { peak: [11, 1], low: [5, 6], peakFactor: 0.05, lowFactor: -0.04 },
    '娱乐休闲': { peak: [7, 8], low: [2], peakFactor: 0.1, lowFactor: -0.05 },
    '图书文具': { peak: [9], low: [2], peakFactor: 0.15, lowFactor: -0.08 }
  };
  
  const pattern = seasonalPatterns[category] || { peak: [], low: [], peakFactor: 0, lowFactor: 0 };
  
  if (pattern.peak.includes(month)) {
    return pattern.peakFactor;
  } else if (pattern.low.includes(month)) {
    return pattern.lowFactor;
  }
  
  return 0;
}

function analyzeTrend(priceHistory) {
  if (priceHistory.length < 3) {
    return { direction: '稳定', magnitude: '无明显趋势', slope: 0 };
  }
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const n = priceHistory.length;
  
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = priceHistory[i].price;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgPrice = sumY / n;
  const trendPercent = (slope / avgPrice) * 100;
  
  let direction = '稳定';
  let magnitude = '';
  
  if (trendPercent > 0.5) {
    direction = '上涨';
    magnitude = trendPercent > 1 ? '趋势明显' : '趋势温和';
  } else if (trendPercent < -0.5) {
    direction = '下降';
    magnitude = Math.abs(trendPercent) > 1 ? '趋势明显' : '趋势温和';
  } else {
    magnitude = '波动较小';
  }
  
  return { direction, magnitude, slope: slope / avgPrice };
}

function calculateSeasonalImpact(category, currentMonth) {
  const patterns = {
    '服饰鞋包': { promotionMonths: [6, 11, 12], discount: 0.2 },
    '数码产品': { promotionMonths: [6, 11], discount: 0.25 },
    '美妆护肤': { promotionMonths: [11, 12], discount: 0.18 },
    '家用电器': { promotionMonths: [6, 11], discount: 0.22 },
    '食品生鲜': { promotionMonths: [1, 12], discount: 0.1 },
    '家具家居': { promotionMonths: [11, 1], discount: 0.12 },
    '娱乐休闲': { promotionMonths: [7, 8], discount: 0.15 },
    '图书文具': { promotionMonths: [9], discount: 0.2 }
  };
  
  const pattern = patterns[category] || { promotionMonths: [], discount: 0 };
  
  if (pattern.promotionMonths.includes(currentMonth)) {
    return -pattern.discount;
  }
  
  const nextPromotion = pattern.promotionMonths.find(m => m > currentMonth);
  if (nextPromotion) {
    const monthsAway = nextPromotion - currentMonth;
    return -pattern.discount * (1 - monthsAway * 0.15);
  }
  
  return 0;
}

function calculatePromotionImpact(category, currentMonth) {
  const promotions = [
    { name: '618', month: 6, categories: ['数码产品', '家用电器', '服饰鞋包'], impact: -0.25 },
    { name: '双11', month: 11, categories: ['全部'], impact: -0.3 },
    { name: '双12', month: 12, categories: ['服饰鞋包', '美妆护肤'], impact: -0.2 },
    { name: '年货节', month: 1, categories: ['食品生鲜', '家具家居'], impact: -0.15 },
    { name: '开学季', month: 9, categories: ['数码产品', '图书文具'], impact: -0.15 }
  ];
  
  const upcoming = promotions.find(p => p.month > currentMonth || (p.month === 1 && currentMonth === 12));
  if (upcoming) {
    const applies = upcoming.categories.includes('全部') || upcoming.categories.includes(category);
    if (applies) {
      const monthsAway = upcoming.month > currentMonth ? upcoming.month - currentMonth : 12 - currentMonth + 1;
      return upcoming.impact * (1 - monthsAway * 0.1);
    }
  }
  
  return 0;
}

function calculatePriceChangeRisk(expectedChange, sensitivity, elasticity) {
  const absoluteChange = Math.abs(expectedChange);
  
  if (absoluteChange > 0.15) {
    return sensitivity > 0.7 ? '高' : '中高';
  } else if (absoluteChange > 0.08) {
    return sensitivity > 0.7 ? '中高' : '中';
  } else if (absoluteChange > 0.03) {
    return '中';
  }
  
  return '低';
}

function determineBestBuyWindow(category, currentMonth, trendAnalysis, expectedChange) {
  const pattern = {
    '服饰鞋包': { bestMonths: [6, 11, 12], worstMonths: [3, 4] },
    '数码产品': { bestMonths: [6, 11], worstMonths: [2, 3] },
    '美妆护肤': { bestMonths: [11, 12], worstMonths: [3, 4] },
    '家用电器': { bestMonths: [6, 11], worstMonths: [2] },
    '食品生鲜': { bestMonths: [1, 12], worstMonths: [8] },
    '家具家居': { bestMonths: [11, 1], worstMonths: [5, 6] },
    '娱乐休闲': { bestMonths: [7, 8], worstMonths: [2] },
    '图书文具': { bestMonths: [9], worstMonths: [2] }
  }[category] || { bestMonths: [], worstMonths: [] };
  
  if (pattern.bestMonths.includes(currentMonth)) {
    return '当前是最佳购买时机';
  } else if (pattern.worstMonths.includes(currentMonth)) {
    return '当前不是最佳购买时机';
  }
  
  if (expectedChange < -0.1) {
    return '建议等待1-2个月后购买';
  } else if (expectedChange < -0.05) {
    return '可考虑等待一段时间';
  } else if (expectedChange > 0.05) {
    return '建议尽快购买';
  }
  
  return '当前购买时机适中';
}

function generatePriceTrendRecommendation(riskLevel, expectedChange, bestBuyWindow) {
  if (riskLevel === '高' && expectedChange < -0.1) {
    return `⚠️ 价格变化风险较高，${bestBuyWindow}，预计可节省${Math.abs(Math.round(expectedChange * 100))}%`;
  } else if (riskLevel === '中高' && expectedChange < -0.08) {
    return `💡 ${bestBuyWindow}，预计价格会有${Math.abs(Math.round(expectedChange * 100))}%的下降空间`;
  } else if (expectedChange > 0.05) {
    return `📈 价格呈上涨趋势，${bestBuyWindow}`;
  }
  
  return `📊 价格走势稳定，${bestBuyWindow}`;
}

// 消费模式识别
function identifyConsumptionPatterns(userRecords, categoryAnalysis, timeDistribution) {
  const patterns = [];

  if (timeDistribution.peakHour >= 20 || timeDistribution.peakHour <= 2) {
    patterns.push({
      type: 'night_shopper',
      title: '夜间购物者',
      description: '您的消费高峰在夜间，这可能与夜间情绪波动或空闲时间有关',
      advice: '建议限制夜间购物，避免情绪化消费'
    });
  }

  if (timeDistribution.weekDayDistribution.weekend > timeDistribution.weekDayDistribution.workday * 1.5) {
    patterns.push({
      type: 'weekend_shopper',
      title: '周末购物者',
      description: '您的消费主要集中在周末，可能是利用周末时间集中购物',
      advice: '周末购物前制定购物清单，避免无计划消费'
    });
  }

  const highRiskCategories = Object.entries(categoryAnalysis)
    .filter(([cat, data]) => data.rejected > data.total * 0.5)
    .map(([cat]) => cat);
  
  if (highRiskCategories.length > 0) {
    patterns.push({
      type: 'category_risk',
      title: '特定类别风险',
      description: `您在「${highRiskCategories.join('」「')}」类别的拒绝率较高，说明这些类别对您来说诱惑较大`,
      advice: `建议减少浏览「${highRiskCategories.join('」「')}」类别的商品，或设置专项预算`
    });
  }

  const expensiveCategories = Object.entries(categoryAnalysis)
    .filter(([cat, data]) => data.avgPrice > 1000)
    .map(([cat]) => cat);
  
  if (expensiveCategories.length > 0) {
    patterns.push({
      type: 'big_spender',
      title: '大额消费倾向',
      description: `您在「${expensiveCategories.join('」「')}」类别的消费金额较高`,
      advice: `大额消费前建议等待72小时冷静期，并对比多个渠道价格`
    });
  }

  const acceptRecords = userRecords.filter(r => r.decision === 'accept');
  const highRiskAccepts = acceptRecords.filter(r => r.risk_level === 'high' || r.risk_level === 'very-high');
  
  if (highRiskAccepts.length > acceptRecords.length * 0.2) {
    patterns.push({
      type: 'risk_taker',
      title: '风险偏好型消费者',
      description: '您接受了较多高风险商品，可能存在一定的冲动消费倾向',
      advice: '建议加强对高风险商品的审查，严格执行冷静期制度'
    });
  }

  return {
    patterns,
    patternCount: patterns.length,
    description: patterns.length > 0 
      ? `识别到${patterns.length}种消费模式，建议针对性调整消费习惯`
      : '未识别到明显的消费模式，消费行为较为均衡'
  };
}

// 冲动消费趋势分析（新增）
function analyzeImpulseTrend(userRecords) {
  if (userRecords.length < 2) {
    return {
      trend: 'insufficient_data',
      description: '数据不足，无法分析趋势',
      avgImpulseScore: 0,
      trendDirection: 'stable'
    };
  }

  const sortedRecords = [...userRecords].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const firstHalf = sortedRecords.slice(0, Math.floor(sortedRecords.length / 2));
  const secondHalf = sortedRecords.slice(Math.floor(sortedRecords.length / 2));

  const firstAvg = firstHalf.reduce((sum, r) => sum + (r.impulse_score || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + (r.impulse_score || 0), 0) / secondHalf.length;
  const overallAvg = sortedRecords.reduce((sum, r) => sum + (r.impulse_score || 0), 0) / sortedRecords.length;

  const changePercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  let trendDirection = 'stable';
  let description = '';

  if (changePercent <= -20) {
    trendDirection = 'improving';
    description = `冲动消费倾向明显改善，近期冲动评分降低了${Math.abs(Math.round(changePercent))}%`;
  } else if (changePercent >= 20) {
    trendDirection = 'worsening';
    description = `冲动消费倾向有所上升，近期冲动评分增加了${Math.round(changePercent)}%，建议加强自我约束`;
  } else {
    trendDirection = 'stable';
    description = `冲动消费倾向保持稳定，平均冲动评分为${overallAvg.toFixed(1)}`;
  }

  return {
    trend: trendDirection,
    description,
    avgImpulseScore: Math.round(overallAvg * 10) / 10,
    firstPeriodAvg: Math.round(firstAvg * 10) / 10,
    secondPeriodAvg: Math.round(secondAvg * 10) / 10,
    changePercent: Math.round(changePercent),
    trendDirection
  };
}

// 营销套路抵抗力分析（新增）
function analyzeTacticResistance(userRecords) {
  if (userRecords.length < 3) {
    return {
      resistanceLevel: 'unknown',
      description: '数据不足，无法评估抵抗力',
      detectedTacticCount: 0,
      resistedTacticCount: 0
    };
  }

  const allTactics = [];
  const resistedTactics = [];

  userRecords.forEach(record => {
    const tactics = record.detected_tactics || [];
    tactics.forEach(tactic => {
      allTactics.push(tactic);
      if (record.decision === 'reject' || record.decision === 'wait') {
        resistedTactics.push(tactic);
      }
    });
  });

  const totalTactics = allTactics.length;
  const totalResisted = resistedTactics.length;
  const resistanceRate = totalTactics > 0 ? (totalResisted / totalTactics) : 0;

  // 计算每种套路的抵抗率
  const tacticStats = {};
  allTactics.forEach(tactic => {
    if (!tacticStats[tactic]) tacticStats[tactic] = { total: 0, resisted: 0 };
    tacticStats[tactic].total++;
  });
  resistedTactics.forEach(tactic => {
    if (tacticStats[tactic]) tacticStats[tactic].resisted++;
  });

  const weaknessTactics = Object.entries(tacticStats)
    .map(([name, stats]) => ({
      name,
      resistanceRate: stats.total > 0 ? Math.round((stats.resisted / stats.total) * 100) : 0,
      encounterCount: stats.total
    }))
    .filter(t => t.encounterCount >= 2)
    .sort((a, b) => a.resistanceRate - b.resistanceRate)
    .slice(0, 3);

  let resistanceLevel = 'medium';
  let description = '';

  if (resistanceRate >= 0.7) {
    resistanceLevel = 'high';
    description = `营销套路抵抗力较强，遇到套路时${Math.round(resistanceRate * 100)}%的情况下能做出理性决策`;
  } else if (resistanceRate >= 0.4) {
    resistanceLevel = 'medium';
    description = `营销套路抵抗力一般，遇到套路时${Math.round(resistanceRate * 100)}%的情况下能做出理性决策`;
  } else {
    resistanceLevel = 'low';
    description = `营销套路抵抗力较弱，遇到套路时仅${Math.round(resistanceRate * 100)}%的情况下能做出理性决策，建议提高警惕`;
  }

  return {
    resistanceLevel,
    description,
    resistanceRate: Math.round(resistanceRate * 100),
    detectedTacticCount: totalTactics,
    resistedTacticCount: totalResisted,
    weaknessTactics
  };
}

// 消费决策质量分析（新增）
function analyzeDecisionQuality(userRecords) {
  if (userRecords.length < 3) {
    return {
      qualityLevel: 'insufficient',
      description: '数据不足，无法评估决策质量',
      consistencyScore: 0,
      accuracyScore: 0
    };
  }

  // 决策一致性：低风险接受 + 高风险拒绝 = 一致
  const consistentDecisions = userRecords.filter(r => {
    const isLowRiskAccept = (r.risk_level === 'low' || r.risk_level === 'low-medium') && r.decision === 'accept';
    const isHighRiskReject = (r.risk_level === 'high' || r.risk_level === 'medium-high') && (r.decision === 'reject' || r.decision === 'wait');
    return isLowRiskAccept || isHighRiskReject;
  }).length;

  const consistencyScore = Math.round((consistentDecisions / userRecords.length) * 100);

  // 决策准确性：拒绝的商品确实节省了钱
  const rejectedRecords = userRecords.filter(r => r.decision === 'reject');
  const accurateRejects = rejectedRecords.filter(r => r.saved_amount > 0).length;
  const accuracyScore = rejectedRecords.length > 0
    ? Math.round((accurateRejects / rejectedRecords.length) * 100)
    : 0;

  // 综合质量评分
  const overallScore = Math.round((consistencyScore * 0.6) + (accuracyScore * 0.4));

  let qualityLevel = 'medium';
  let description = '';

  if (overallScore >= 80) {
    qualityLevel = 'excellent';
    description = `决策质量优秀（综合评分${overallScore}分），消费决策既一致又准确`;
  } else if (overallScore >= 60) {
    qualityLevel = 'good';
    description = `决策质量良好（综合评分${overallScore}分），大部分消费决策是合理的`;
  } else if (overallScore >= 40) {
    qualityLevel = 'fair';
    description = `决策质量一般（综合评分${overallScore}分），部分决策存在改进空间`;
  } else {
    qualityLevel = 'poor';
    description = `决策质量有待提高（综合评分${overallScore}分），建议建立更明确的购买标准`;
  }

  return {
    qualityLevel,
    description,
    overallScore,
    consistencyScore,
    accuracyScore,
    totalDecisions: userRecords.length,
    consistentDecisions,
    rejectedCount: rejectedRecords.length,
    accurateRejections: accurateRejects
  };
}

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`AI消费防冲动理性参谋后端服务运行在 http://localhost:${PORT}`);
    console.log(`API健康检查: http://localhost:${PORT}/api/health`);
    console.log(`Loaded impulseIndicators count: ${impulseIndicators ? impulseIndicators.length : 'undefined'}`);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

module.exports = app;