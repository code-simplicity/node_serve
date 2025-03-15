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
const compression = require('compression');
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

// 日志中间件
if (config.env === 'development') {
	app.use(logger('dev'));
} else {
	app.use(logger('combined'));
}

app.use(express.json());
app.use(
	express.urlencoded({
		extended: false,
	})
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());
// 参数污染
app.use(hpp());
app.use(methodOverride());
// 压缩响应
app.use(compression());

// 注册路由
require('./config/routes')(app);

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
	// 记录错误
	console.error(err);
	// 根据环境返回适当的错误信息
	const errorDetails =
  process.env.NODE_ENV === 'development'
			? { message: err.message, stack: err.stack }
			: { message: 'Internal Server Error' };
      res.status(500).json({ error: errorDetails });
}
// 添加请求超时中间件
app.use((req, res, next) => {
  res.setTimeout(config.TIMEOUT, () => {
    res.status(408).send('请求超时');
  });
  next();
});
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);


module.exports = app;
