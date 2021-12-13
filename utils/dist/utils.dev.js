"use strict";

var Constants = require("./Constants");

var path = require("path");

var fs = require("fs-extra"); // 创建文件夹


var mkdirsSync = function mkdirsSync(dirname) {
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
  dateFormat: function dateFormat(str, type) {
    var date = new Date(str);
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var seconds = date.getSeconds();

    if (type === "YYYY-MM-DD") {
      return "".concat(year, "_").concat(month, "_").concat(day);
    } else if (type === "YYYY-MM-DD HH:MM:SS") {
      return "".concat(year, "-").concat(month, "-").concat(day, " ").concat(hour, ":").concat(minute, ":").concat(seconds);
    } else if (type === "MM/DD  HH:MM:SS") {
      return "".concat(month, "/").concat(day, " ").concat(hour, ":").concat(minute, ":").concat(seconds);
    }
  },
  // 判断图片类型是否是平时我们所支持的
  getType: function getType(contentType, name) {
    var type = null;

    if (Constants.TYPE_PNG_WITH_PREFIX === contentType && name === Constants.TYPE_PNG) {
      type = Constants.TYPE_PNG;
    } else if (Constants.TYPE_JPG_WITH_PREFIX === contentType && name === Constants.TYPE_JPG) {
      type = Constants.TYPE_JPG;
    } else if (Constants.TYPE_GIF_WITH_PREFIX === contentType && name === Constants.TYPE_GIF) {
      type = Constants.TYPE_GIF;
    }

    return type;
  },
  //获取时间
  getNowFormatDate: function getNowFormatDate() {
    var date = new Date();
    var seperator = "-";
    var month = this.formatZero(date.getMonth() + 1, 2);
    var day = this.formatZero(date.getDate(), 2);
    var currentdate = date.getFullYear() + seperator + month + seperator + day;
    return currentdate.toString();
  },
  // 分页
  pageFilter: function pageFilter(arr, pageNum, pageSize) {
    // 页数
    pageNum = pageNum * 1; // 每页数量

    pageSize = pageSize * 1; // 总数

    var total = arr.length; // 页数

    var pages = Math.floor((total + pageSize - 1) / pageSize);
    var start = pageSize * (pageNum - 1);
    var end = start + pageSize <= total ? start + pageSize : total; // 数据

    var list = [];

    for (var i = start; i < end; i++) {
      list.push(arr[i]);
    }

    return {
      pageNum: pageNum,
      total: total,
      pages: pages,
      pageSize: pageSize,
      list: list
    };
  },
  // 补0的方法
  formatZero: function formatZero(num, len) {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
  },
  mkdirsSync: mkdirsSync
};