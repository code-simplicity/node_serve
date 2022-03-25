const Constants = require("./Constants");
const path = require("path");
const fs = require("fs-extra");
// 加密库
const CryptoJS = require("crypto-js")
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
// 日期格式化
function dateFormat(str, type) {
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
};

// 判断图片类型是否是平时我们所支持的
function getType(contentType, name) {
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
};

//获取时间
function getNowFormatDate() {
  const date = new Date();
  const seperator = "-";
  let month = this.formatZero(date.getMonth() + 1, 2);
  let day = this.formatZero(date.getDate(), 2);
  const currentdate =
    date.getFullYear() + seperator + month + seperator + day;
  return currentdate.toString();
};

// 分页
function pageFilter(arr, pageNum, pageSize) {
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
};

// 补0的方法
function formatZero(num, len) {
  if (String(num).length > len) return num;
  return (Array(len).join(0) + num).slice(-len);
};

// 判断字符串是否为空
function isEmpty(text) {
  return text === null || text === undefined ? true : false
}

/**
 * 获取cookie的key
 * @param {*} request req.cookies
 * @param {*} key 
 * @returns 
 */
function getCookieKey(request, key) {
  const cookie = request
  console.log("cookie ==>", cookie)
  if (cookie === null || cookie === undefined) {
    console.log("cookie is null")
    return null
  }
  for (const cookieKey in cookie) {
    if (key === cookieKey) {
      return cookie[cookieKey]
    }
  }
}

/**
 * 设置cookie
 * @param {*} response 响应结果
 * @param {*} key 关键字
 * @param {*} value 具体值
 * @param {*} age 时间
 */
function setCookieKey(response, key, value, age) {
  response.cookie(key, value, {
    maxAge: age
  })
}

/**
 * 删除cookie
 * @param {*} response 
 * @param {*} key 
 */
function delCookieKey(response, key) {
  response.cookie(key, "", {
    maxAge: ""
  })
}

/**
 * DES加密
 * @param {*} message 
 * @returns 
 */
function desEncrypt(message, desKey) {
  const encrypted = CryptoJS.DES.encrypt(message, desKey)
  return encrypted.toString()
}

/**
 * des解密方法
 * @param {*} ciphertext 
 * @returns 
 */
function desDecrypt(ciphertext, desKey) {
  if (ciphertext === "" || ciphertext === null || ciphertext === undefined) {
    return ""
  }
  if (typeof (ciphertext) === "string") {
    ciphertext = ciphertext.toString();
  }
  const decrypted = CryptoJS.DES.decrypt(ciphertext, desKey)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

module.exports = {
  dateFormat,
  getType,
  getNowFormatDate,
  pageFilter,
  formatZero,
  isEmpty,
  // 异步创建文件夹
  mkdirsSync,
  getCookieKey,
  setCookieKey,
  delCookieKey,
  desEncrypt,
  desDecrypt
};