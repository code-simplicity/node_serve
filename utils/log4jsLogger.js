const path = require("path");
const log4js = require("log4js");

// 配置log4js
log4js.configure({
  appenders: {
    // 控制台输出
    console: {
      type: "console",
    },
    // 日志文件
    file: {
      type: "dateFile",
      filename: path.join(__dirname, "../logs/app.log"),
      // 日志切割后文件名后缀格式
      pattern: ".yyyy-MM-dd",
    },
  },
  categories: {
    // 默认日志
    default: {
      appenders: ["file", "console"],
      level: "debug",
    },
  },
});

// 获取默认日志
const logger = log4js.getLogger();

module.exports = logger;
