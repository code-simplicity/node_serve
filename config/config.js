// 实际的配置环境

// 生产环境
const {
  configDev,
  redisConfig

} = require("./config-dev");

// 上线环境
const {
  configProd
} = require("./config-prod");

const config = configProd;
const redisDB = redisConfig;

// 暴露
module.exports = {
  config,
  redisDB
};