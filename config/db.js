const {
    Sequelize
} = require('sequelize');
// 连接数据库
const config = require('./config')

// 配置数据库连接
const sequelizedb = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    // 连接池设置
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    },

    // 自定义日志
    logging: function (message) {
        console.debug(message);
    },
    // 全局配置表名和Model名称一致,全局禁用时间戳
    define: {
        freezeTableName: true,
        timestamps: false
    }
});

// 测试连接数据库是否成功
try {
    sequelizedb.authenticate();
    // 一次性同步使用模型
    sequelize.sync();
    console.log('数据库连接成功');
} catch (error) {
    console.error('无法连接数据库，请检查重试:', error);
};

// 暴露配置
module.exports = sequelizedb;