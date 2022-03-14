// 开发者环境
const configProd = {
  database: "design_project", // 使用哪个数据库
  username: "root", // 用户名
  password: "123456", // 口令
  // host: "localhost", // 主机名
  host: "192.168.1.112", // 主机名
  port: 3306, // 端口号，MySQL默认3306
};

// 配置图片上传的位置,生产环境
const uploadProd = "/root/docker/Graduation-Project/uploadUrl";

// 暴露配置
module.exports = {
  configProd,
  uploadProd
};