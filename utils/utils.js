const Constants = require("./Constants");
const path = require("path");
const fs = require("fs-extra");
// 创建文件夹
const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
};
module.exports = {
  // 日期格式化
  dateFormat(str, type) {
    let date = new Date(str);
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();
    if (type === "YYYY-MM-DD") {
      return `${year}_${month}_${day}`;
    } else if (type === "YYYY-MM-DD HH:MM:SS") {
      return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
    } else if (type === "MM/DD  HH:MM:SS") {
      return `${month}/${day} ${hour}:${minute}:${seconds}`;
    }
  },

  // 判断图片类型是否是平时我们所支持的
  getType(contentType, name) {
    let type = null;
    if (
      Constants.TYPE_PNG_WITH_PREFIX === contentType &&
      name === Constants.TYPE_PNG
    ) {
      type = Constants.TYPE_PNG;
    } else if (
      Constants.TYPE_JPG_WITH_PREFIX === contentType &&
      name === Constants.TYPE_JPG
    ) {
      type = Constants.TYPE_JPG;
    } else if (
      Constants.TYPE_GIF_WITH_PREFIX === contentType &&
      name === Constants.TYPE_GIF
    ) {
      type = Constants.TYPE_GIF;
    }
    return type;
  },

  //获取时间
  getNowFormatDate() {
    const date = new Date();
    const seperator = "-";
    let month = this.formatZero(date.getMonth() + 1, 2);
    let day = this.formatZero(date.getDate(), 2);
    const currentdate =
      date.getFullYear() + seperator + month + seperator + day;
    return currentdate.toString();
  },

  // 分页
  pageFilter(arr, pageNum, pageSize) {
    // 页数
    pageNum = pageNum * 1;
    // 每页数量
    pageSize = pageSize * 1;
    // 总数
    const total = arr.length;
    // 页数
    const pages = Math.floor((total + pageSize - 1) / pageSize);
    const start = pageSize * (pageNum - 1);
    const end = start + pageSize <= total ? start + pageSize : total;
    // 数据
    const list = [];
    for (let i = start; i < end; i++) {
      list.push(arr[i]);
    }
    return {
      pageNum,
      total,
      pages,
      pageSize,
      list,
    };
  },
  // 补0的方法
  formatZero(num, len) {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
  },

  // 判断字符串是否为空
  isEmpty(text) {
    return text === null ? true : false
  },

  // 异步创建文件夹
  mkdirsSync,
};