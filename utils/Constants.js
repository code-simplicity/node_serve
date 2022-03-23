// 图片类型
const PREFIX = "image/";
const TYPE_JPG = "jpg";
const TYPE_PNG = "png";
const TYPE_GIF = "gif";
// 图片类型组合
const TYPE_JPG_WITH_PREFIX = PREFIX + "jpg";
const TYPE_PNG_WITH_PREFIX = PREFIX + "png";
const TYPE_GIF_WITH_PREFIX = PREFIX + "gif";

// 状态码
class baseResultCode {
  // 成功
  static SUCCESS = 20000
  // 失败
  static FAILED = 40000
  // api调用过于频繁
  static API_BUSY = 40001
}

// 七牛云
// const QI_NIU_CONFIG = {
//   accessKey: "hQcQH0SY8z8-TfBCStSAUkWtGkzP-Od6qKSiR-Kz",
//   secretKey: "OhIvXXXpJ8ty-KStq3YDG_JOb-vJEmXTH9aVkobi",
//   bucket: "node_images"
// }

// 腾讯云对象存储配置
const txCosConfig = {
  // id
  SecretId: "AKIDiGXYHjuoRnsglxyjETSCgusb4GCuMZVA",
  // key
  SecretKey: "TfZCYdS2MPChvsY0EEzVmob9SWTBesrc",
  // 存储桶名字
  Bucket: "bugdr-project-1305152720",
  // 存储桶Region，也就是地点，可以在COS控制台指定存储桶的概览页查看
  Region: "ap-beijing",
}

// 邮箱发送
const partnerEmail = {
  QQ: {
    host: "smtp.qq.com",
    port: 465,
    user: "468264345@qq.com",
    pass: "ldufdvxeackubidi"
  },
  163: {
    host: "smtp.163.com",
    port: 465,
    user: "xxx",
    pass: "xxx"
  }
}

module.exports = {
  TYPE_JPG,
  TYPE_PNG,
  TYPE_GIF,
  TYPE_JPG_WITH_PREFIX,
  TYPE_PNG_WITH_PREFIX,
  TYPE_GIF_WITH_PREFIX,
  baseResultCode,
  txCosConfig,
  partnerEmail
};