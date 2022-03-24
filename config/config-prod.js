// 生产者环境
const configProd = {
  database: "design_project", // 使用哪个数据库
  username: "root", // 用户名
  password: "123456", // 口令
  host: "101.42.107.166", // 主机名
  port: 3306, // 端口号，MySQL默认3306
};

// redis配置
const redisConfig = {
  database: "0", // 使用0号数据库
  url: "101.42.107.166", // 主机地址
  port: 6379, // 端口
  password: "123456" // 密码
}

// 暴露配置
module.exports = {
  configProd,
  redisConfig
};