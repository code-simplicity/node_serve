// 实际的配置环境

// 生产环境
const { configDev, uploadDev } = require("./config-dev");

// 上线环境
const { configProd, uploadProd } = require("./config-prod");

let config = "";
let uploadUrl = "";
// 判断环境
if (process.env.NODE_ENV === "development") {
  config = configDev;
  uploadUrl = uploadDev;
} else {
  config = configProd;
  uploadUrl = uploadProd;
}
// if (process.env.NODE_ENV === "production") {
//   config = require(configProd);
// }

// 暴露
module.exports = { config, uploadUrl };
