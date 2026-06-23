const http = require('http');

async function testDiagnosticAPI() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: '/api/diagnostic/1',
            method: 'GET'
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
        req.end();
    });
}

function simulateRender(report) {
    console.log('\n=== 模拟前端渲染测试 ===\n');
    
    try {
        if (!report.hasData) {
            console.log('❌ 无数据');
            return false;
        }

        const requiredFields = [
            'overview.rationalityScore',
            'overview.totalAnalyzed',
            'overview.totalSaved',
            'overview.rejectRate',
            'overview.monthlySaved',
            'riskDistribution',
            'conclusions',
            'personalRules'
        ];

        let allFieldsPresent = true;
        for (const field of requiredFields) {
            const value = field.split('.').reduce((obj, key) => obj?.[key], report);
            if (value === undefined) {
                console.log(`❌ 缺失字段: ${field}`);
                allFieldsPresent = false;
            }
        }

        if (!allFieldsPresent) return false;

        console.log('✅ 所有必需字段都存在');
        console.log(`\n📊 理性指数: ${report.overview.rationalityScore}`);
        console.log(`📈 累计分析: ${report.overview.totalAnalyzed} 次`);
        console.log(`💰 累计节省: ¥${report.overview.totalSaved.toLocaleString()}`);
        console.log(`🚫 拒绝率: ${report.overview.rejectRate}%`);
        console.log(`📉 本月节省: ¥${report.overview.monthlySaved.toLocaleString()}`);
        console.log(`\n🔴 高风险: ${report.riskDistribution.high}`);
        console.log(`🟡 中风险: ${report.riskDistribution.medium}`);
        console.log(`🟢 低风险: ${report.riskDistribution.low}`);
        console.log(`\n💡 结论: ${report.conclusions[0]?.title}`);
        console.log(`📝 个人准则数量: ${report.personalRules?.length}`);

        return true;
    } catch (error) {
        console.error('❌ 渲染模拟失败:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('=== 诊断报告功能测试 ===\n');

    console.log('1. 测试 API 响应...');
    try {
        const report = await testDiagnosticAPI();
        console.log('✅ API 响应成功');
        console.log('状态: ', report.hasData ? '有数据' : '无数据');
        
        if (report.hasData) {
            const renderSuccess = simulateRender(report);
            console.log('\n' + (renderSuccess ? '✅ 渲染测试通过' : '❌ 渲染测试失败'));
        } else {
            console.log('⚠️ 无数据，无法测试渲染');
        }
    } catch (error) {
        console.error('❌ API 测试失败:', error.message);
    }

    console.log('\n=== 测试完成 ===');
}

runTests();