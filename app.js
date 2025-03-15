const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
// html攻击
const sanitizeHtml = require('sanitize-html'); // 替换xss-clean
const hpp = require('hpp');
const cors = require('cors');

// 门户接口
const portalUserRouter = require('./routes/portal/user');
const portalUserExRouter = require('./routes/portal/userEx');
const portalContentRouter = require('./routes/portal/content');
const portalPortMapRouter = require('./routes/portal/portmap');
const portalVideoRouter = require('./routes/portal/video');
const portalChooseRouter = require('./routes/portal/choose');
const portalPortPointMapRouter = require('./routes/portal/portpointmap');
const portalPointMapRouter = require('./routes/portal/point');
const portalWaveFormsRouter = require('./routes/portal/waveforms');
const portalWaveStatsRouter = require('./routes/portal/wavestats');
const portalWaveDataExcelRouter = require('./routes/portal/waveDataExcelRouter');
const portalBimServer = require('./routes/portal/bimRouter');

// 管理员接口
const adminUserRouter = require('./routes/admin/userRouter');
const adminExcelRouter = require('./routes/admin/excelRouter');
const adminChooseRouter = require('./routes/admin/chooseRouter');
const adminContentRouter = require('./routes/admin/contentRouter');
const adminVideoRouter = require('./routes/admin/videoRouter');
const adminPortMapRouter = require('./routes/admin/portMapRouter');
const adminPortPointMapRouter = require('./routes/admin/portPointMapRouter');
const adminPointRouter = require('./routes/admin/pointRouter');
const adminWaveFormsRouter = require('./routes/admin/waveFormsRouter');
const adminWaveStatsRouter = require('./routes/admin/waveStatsRouter');
const adminWaveDataExcelRouter = require('./routes/admin/waveDataExcelRouter');
const adminBimRouter = require('./routes/admin/bimRouter');

// 图灵验证码
const captchaRouter = require('./routes/captcha');
// 添加测试功能代码
const testRouter = require('./routes/test/code');
const config = require('./config/config');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(helmet());
// 限制请求
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15分钟
	max: 500, // 每个IP最多500个请求
});
app.use('/', limiter);
// 自定义中间件防止XSS攻击
app.use((req, res, next) => {
	if (req.body) {
		// 递归清理请求体中的所有字符串
		const sanitizeObject = (obj) => {
			if (!obj) return obj;

			if (typeof obj === 'string') {
				return sanitizeHtml(obj, {
					allowedTags: [], // 不允许任何HTML标签
					allowedAttributes: {}, // 不允许任何HTML属性
				});
			}

			if (typeof obj === 'object') {
				Object.keys(obj).forEach((key) => {
					obj[key] = sanitizeObject(obj[key]);
				});
			}

			return obj;
		};

		req.body = sanitizeObject(req.body);
	}
	next();
});
// NoSQL注入防护
app.use(mongoSanitize());

// 处理跨域
app.use((req, res, next) => {
	//判断路径
	if (req.path !== '/' && !req.path.includes('.')) {
		res.set({
			'Access-Control-Allow-Credentials': true, //允许后端发送cookie
			'Access-Control-Allow-Origin': req.headers.origin || '*', //任意域名都可以访问,或者基于我请求头里面的域
			'Access-Control-Allow-Headers':
				'Content-Type, Authorization, X-Requested_With', //设置请求头格式和类型
			'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS', //允许支持的请求方式
			'Content-Type': 'application/json; charset=utf-8', //默认与允许的文本格式json和编码格式
		});
	}
	if (req.method.toLowerCase() == 'options') {
		res.status(204).send(200);
	} else {
		next();
	}
});

// 配置CORS，后续生产环境之后配置特殊域名/ip才能访问
app.use(
	cors({
		origin: (origin, callback) => {
			// 开发环境都可以访问
			if (process.env.NODE_ENV !== 'production' || !origin) {
				return callback(null, true);
			}
			// 生产环境：检查白名单，后期部署再补充
			const whitelist = ['*'];
			if (whitelist.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('CORS 策略不允许此源访问'));
			}
		},
		credentials: true,
		optionsSuccessStatus: 204,
	})
);

// 环境感知的错误处理
// app.use((err, req, res, next) => {
// 	const errorDetails = config.env === 'development' ? err.stack : {};

// 	res.status(err.status || 500).json({
// 		error: {
// 			message: err.message,
// 			...(config.env === 'development' ? { stack: err.stack } : {}),
// 		},
// 	});
// });

app.use(logger('dev'));
app.use(express.json());
app.use(
	express.urlencoded({
		extended: false,
	})
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 加载路由
app.use('/', captchaRouter);
app.use('/test', testRouter);
app.use(
	'/portal',
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
	portalBimServer
);

app.use(
	'/admin',
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
	adminBimRouter
);

app.use(function (req, res, next) {
	next(createError(404));
});

function logErrors(err, req, res, next) {
	console.error(err.stack);
	next(err);
}

function clientErrorHandler(err, req, res, next) {
	if (req.xhr) {
		res.status(500).send({
			error: 'Something failed!',
		});
	} else {
		next(err);
	}
}

function errorHandler(err, req, res, next) {
	res.status(500);
	res.render('error', {
		error: err,
	});
}

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());
// 参数污染
app.use(hpp())
app.use(methodOverride());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// 错误处理
app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500).send('Something broke!');
});

module.exports = app;
