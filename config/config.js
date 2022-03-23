// 实际的配置环境

// 生产环境
const {
  configDev,
  redisConfig

} = require("./config-dev");

// 上线环境
const {
  configProd,
  redisConfig
} = require("./config-prod");

const config = configDev;

// 暴露
module.exports = {
  config,
  redisConfig
};