// 实际的配置环境
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
const envFile =
	process.env.NODE_ENV === 'production'
		? '.env.production'
		: '.env.development';

dotenv.config({ path: path.join(__dirname, '..', envFile) });


const config = {
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,
  TIMEOUT: process.env.TIMEOUT || 60 * 1000,

	// 数据库配置
	mysqlDb: {
		host: process.env.MYSQL_DB_HOST,
		port: process.env.MYSQL_DB_PORT,
		username: process.env.MYSQL_DB_USERNAME,
		password: process.env.MYSQL_DB_PASSWORD,
		database: process.env.MYSQL_DB_DATABASE,
	},

	// 数据库配置
	api: {
		prefix: '/api',
    version: 'v1'
	},

	// CORS配置
	cors: {
		whitelist: process.env.ALLOWED_ORIGINS
			? process.env.ALLOWED_ORIGINS.split(',')
			: [],
	},

	// 日志配置
	logs: {
		level: process.env.LOG_LEVEL || 'info',
	},

	// redis配置
	redisDb: {
		database: process.env.REDIS_DB || '0',
		url: process.env.REDIS_URL,
		port: process.env.REDIS_PORT || 6379,
		password: process.env.REDIS_PASSWORD,
	},
};

// 暴露
module.exports = config;
