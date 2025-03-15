const { Sequelize } = require('sequelize');

// 连接数据库
const config = require('./config');

// 配置数据库连接
const sequelizeDb = new Sequelize(
	config.mysqlDb.database,
	config.mysqlDb.username,
	config.mysqlDb.password,
	{
		host: config.mysqlDb.host,
		dialect: 'mysql',
		// 连接池设置
		pool: {
			max: 30,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},

		// 自定义日志
		logging: function (message) {
			console.debug(message);
		},
		// 全局配置表名和Model名称一致,全局禁用时间戳
		define: {
			freezeTableName: true,
			timestamps: false,
		},
	}
);

// 测试连接数据库是否成功
try {
	sequelizeDb.authenticate();
	// 一次性同步使用模型
	(async () => {
		await sequelizeDb.sync({
			alter: true,
		});
	})();
	console.log('数据库连接成功');
} catch (error) {
	console.error('无法连接数据库，请检查重试:', error);
}

// 暴露配置
module.exports = sequelizeDb;
