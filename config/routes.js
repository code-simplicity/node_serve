const express = require('express');
const config = require('./config');

// 门户接口
const portalUserRouter = require('../routes/portal/user');
const portalUserExRouter = require('../routes/portal/userEx');
const portalContentRouter = require('../routes/portal/content');
const portalPortMapRouter = require('../routes/portal/portmap');
const portalVideoRouter = require('../routes/portal/video');
const portalChooseRouter = require('../routes/portal/choose');
const portalPortPointMapRouter = require('../routes/portal/portpointmap');
const portalPointMapRouter = require('../routes/portal/point');
const portalWaveFormsRouter = require('../routes/portal/waveforms');
const portalWaveStatsRouter = require('../routes/portal/wavestats');
const portalWaveDataExcelRouter = require('../routes/portal/waveDataExcelRouter');
const portalBimServer = require('../routes/portal/bimRouter');

// 管理员接口
const adminUserRouter = require('../routes/admin/userRouter');
const adminExcelRouter = require('../routes/admin/excelRouter');
const adminChooseRouter = require('../routes/admin/chooseRouter');
const adminContentRouter = require('../routes/admin/contentRouter');
const adminVideoRouter = require('../routes/admin/videoRouter');
const adminPortMapRouter = require('../routes/admin/portMapRouter');
const adminPortPointMapRouter = require('../routes/admin/portPointMapRouter');
const adminPointRouter = require('../routes/admin/pointRouter');
const adminWaveFormsRouter = require('../routes/admin/waveFormsRouter');
const adminWaveStatsRouter = require('../routes/admin/waveStatsRouter');
const adminWaveDataExcelRouter = require('../routes/admin/waveDataExcelRouter');
const adminBimRouter = require('../routes/admin/bimRouter');

// 图灵验证码
const captchaRouter = require('../routes/captcha');
// 添加测试功能代码
const testRouter = require('../routes/test/code');

const routes = (app) => {
	// 门户API路由组
	const portalRoutes = [
		portalUserExRouter,
		portalUserRouter,
		portalContentRouter,
		portalPortMapRouter,
		portalVideoRouter,
		portalChooseRouter,
		portalPortPointMapRouter,
		portalPointMapRouter,
		portalWaveFormsRouter,
		portalWaveStatsRouter,
		portalWaveDataExcelRouter,
		portalBimServer,
	];
	app.use('/portal', ...portalRoutes);

	// 管理API路由组
	const adminRoutes = [
		adminUserRouter,
		adminExcelRouter,
		adminChooseRouter,
		adminContentRouter,
		adminVideoRouter,
		adminPortMapRouter,
		adminPortPointMapRouter,
		adminPointRouter,
		adminWaveFormsRouter,
		adminWaveStatsRouter,
		adminWaveDataExcelRouter,
		adminBimRouter,
	];
	app.use('/admin', ...adminRoutes);

	// 加载验证码录音
	app.use('/', captchaRouter);
	// 加载测试录音
	app.use('/test', testRouter);

	// 创建API版本路由
	const apiV1 = express.Router();
	// 挂载到API v1
	apiV1.use('/portal', portalRoutes);
	apiV1.use('/admin', adminRoutes);
	apiV1.use('/', captchaRouter);
	apiV1.use('/test', testRouter);
	// 注册API版本路由
	app.use(`${config.api.prefix}/${config.api.version}`, apiV1);

	// 健康检查端点
	app.get('/health', (req, res) => {
		res.status(200).json({
			status: 'UP',
			timestamp: new Date(),
			uptime: process.uptime(),
			environment: process.env.NODE_ENV,
		});
	});

	return app;
};

module.exports = routes;
