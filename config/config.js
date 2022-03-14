// 实际的配置环境

// 生产环境
const {
  configDev,
  uploadDev
} = require("./config-dev");

// 上线环境
const {
  configProd,
  uploadProd
} = require("./config-prod");

const config = configDev;
const uploadUrl = uploadDev;

// 暴露
module.exports = {
  config,
  uploadUrl
};