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
  SecretId: "AKIDWquhlZ5KIzPXO1NSGn44nFQKyLSIq77q",
  // key
  SecretKey: "TfZDagVvCEzc080cz6xYtyoOkqgGaeS1",
  // 存储桶名字
  Bucket: "tcu-school-1310301293",
  // 存储桶Region，也就是地点，可以在COS控制台指定存储桶的概览页查看
  Region: "ap-beijing",
}

// 邮箱发送
const partnerEmail = {
  QQ: {
    host: "smtp.qq.com",
    port: 465,
    user: "468264345@qq.com",
    pass: "hsurryvymnsdbjfg"
  },
  WY: {
    host: "smtp.163.com",
    port: 465,
    user: "13132053657@163.com",
    pass: "XYASCDJQVXGMJGCM"
  }
}

// 用户公共字段
class User {
  // 邮箱ip
  static EMAIL_IP = "email_ip_"
  // 邮箱地址
  static EMAIL_ADDRESS = "email_address_"
  // 验证码
  static EMAIL_CODE = "email_code_"
  // token
  static TOKEN_KEY = "token_key_"
  static PASSWORD_MESSAGE = "password_message" // crypto-js的第一个参数
  // cookie的名字
  static USER_COOKIE_DATA = "app_cookie_data"
  // 图灵验证码的连接key
  static CAPTCHA_CONTENT = "captcha_content_"
  // 最后出现的图灵验证码的key
  static LAST_CAPTCHA_ID = "last_captcha_id_"
}

class App {
  static FROM_PC = "P_" // 来自哪里，默认来自pc端
}

// 时间
class TimeSecound {
  static ONE = 1 // 1s
  static MIN = 60 * 1 // 1min
  static FIVE_MIN = 5 * 60 // 5min
  static TEN_MIN = 10 * 60 // 10min
  static HOUR = 1 * 60 * 60 // 1hour
  static TWO_HOUR = 2 * 60 * 60 * 60 // 2hour
  static DAY = 24 * 60 * 60 // 1day
  static TEN_DAY = 10 * 24 * 60 * 60 // 10day
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
  partnerEmail,
  User,
  TimeSecound,
  App
};