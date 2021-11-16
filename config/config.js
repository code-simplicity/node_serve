// 实际的配置环境

// 生产环境
const configDev = './config-dev'

// 上线环境
const configProd = './config-prod'

let config = ''
// 判断环境
if (process.env.NODE_ENV === "development") {
    config = require(configDev)
} else {
    config = require(configProd)
}
// if (process.env.NODE_ENV === "production") {
//     config = require(configProd)
// }

// 暴露
module.exports = config;