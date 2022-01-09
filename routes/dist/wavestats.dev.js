"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// 波形统计图标
var express = require("express");

var fs = require("fs");

var path = require("path");

var _require = require("sequelize"),
    Op = _require.Op;

var router = express.Router();

var multer = require("multer"); // 导入暴露的模型


var WaveStatsModel = require("../models/WaveStatsModel");

var utils = require("../utils/utils"); // const { uploadUrl } = require("../config/config");
// 文件上传到服务器的路径,存储在本地的
// 存储在服务器上的,/root/docker/Graduation-Project/uploadUrl
// const dirPath = uploadUrl + "/image/wave-forms/" + utils.getNowFormatDate();


var dirPath = path.join(__dirname, "..", "public/uploadUrl/image/wave-stats/" + utils.getNowFormatDate()); // 配置规则 配置目录/日期/原名称.类型

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, {
        recursive: true
      }, function (err) {
        if (err) {
          console.log(err);
        } else {
          cb(null, dirPath);
        }
      });
    } else {
      cb(null, dirPath);
    }
  },
  filename: function filename(req, file, cb) {
    console.log("filename()", file);
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: storage
});
/**
 * @api {post} /wavestats/upload  上传波形统计图
 * @apiDescription 上传波形统计图
 * @apiName 上传波形统计图
 * @apiGroup WaveStats
 * @apiBody {File} image 图片
 * @apiBody {String} point_id 点位id，外键
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/upload
 * @apiVersion 1.0.0
 */

router.post("/upload", upload.single("image"), function (req, res) {
  var point_id = req.body.point_id;

  if (!point_id) {
    return res.send({
      status: 400,
      msg: "请选择对应的点位id."
    });
  } // 判断是否有文件


  var file = req.file;
  console.log("file", file);

  if (file === null) {
    return res.send({
      status: 400,
      msg: "图片不可以为空."
    });
  } // 获取文件类型是image/png还是其他


  var fileTyppe = file.mimetype; // 获取图片相关数据，比如文件名称，文件类型

  var extName = path.extname(file.path); // 去掉拓展名的一点

  var extNameOut = extName.substr(1); // 返回文件的类型

  var type = utils.getType(fileTyppe, extNameOut);

  if (type === null) {
    res.send({
      status: 400,
      msg: "不支持该类型的图片."
    });
    return;
  } // 先读取这个文件


  fs.readFile(file.path, "base64", function (err, data) {
    if (err) {
      return;
    } else {
      fs.writeFile(file.path, data, "base64", function (err) {
        if (err) {
          return;
        } else {
          console.log("图片写入成功");
        }
      });
    }
  });

  try {
    WaveStatsModel.create({
      point_id: point_id,
      url: file.originalname,
      path: file.path,
      type: fileTyppe,
      name: file.originalname
    }).then(function (result) {
      res.send({
        status: 200,
        msg: "图片上传服务器成功.",
        data: result
      });
    })["catch"](function (error) {
      console.error("图片上传失败.", error);
      res.send({
        status: 400,
        msg: "图片上传失败."
      });
    });
  } catch (error) {
    console.error(err);
  }
});
/**
 * @api {get} /wavestats/delete  删除波形统计图
 * @apiDescription 删除波形统计图
 * @apiName 删除波形统计图
 * @apiGroup WaveStats
 * @apiParam {String} id 波形统计图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/delete
 * @apiVersion 1.0.0
 */

router.get("/delete", function _callee(req, res) {
  var id, data;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = req.query.id; // 获取路径

          _context.next = 3;
          return regeneratorRuntime.awrap(WaveStatsModel.findOne({
            where: {
              id: id
            }
          }));

        case 3:
          data = _context.sent;
          // 删除存储在磁盘的图片
          fs.unlinkSync(data.path);
          WaveStatsModel.destroy({
            where: {
              id: id
            }
          }).then(function (result) {
            res.send({
              status: 200,
              msg: "删除波形统计图成功."
            });
          })["catch"](function (error) {
            console.error("删除波形统计图失败.", error);
            res.send({
              status: 400,
              msg: "删除波形统计图失败."
            });
          });

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
});
/**
 * @api {post} /wavestats/update  修改波形统计图
 * @apiDescription 修改波形统计图
 * @apiName 修改波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} id 波形统计图id
 * @apiBody {String} point_id 点位图id（外键）
 * @apiBody {String} name 图片名称
 * @apiBody {String} state 状态
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/update
 * @apiVersion 1.0.0
 */

router.post("/update", upload.single("image"), function _callee2(req, res) {
  var _req$body, point_id, id, file, data;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, point_id = _req$body.point_id, id = _req$body.id;
          file = req.file;

          if (point_id) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.send({
            status: 400,
            msg: "请选择对应的点位id."
          }));

        case 4:
          if (!(file === null)) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.send({
            status: 400,
            msg: "图片不可以为空."
          }));

        case 6:
          _context2.next = 8;
          return regeneratorRuntime.awrap(WaveStatsModel.findOne({
            where: {
              id: id
            }
          }));

        case 8:
          data = _context2.sent;
          // 删除存储在磁盘的图片
          fs.unlinkSync(data.path);
          WaveStatsModel.update({
            point_id: point_id,
            url: file.originalname,
            path: file.path,
            type: file.mimetype,
            name: file.originalname
          }, {
            where: {
              id: id
            }
          }).then(function (result) {
            res.send({
              status: 200,
              msg: "修改波形统计图成功."
            });
          })["catch"](function (error) {
            console.error("修改波形统计图失败.", error);
            res.send({
              status: 400,
              msg: "修改波形统计图失败."
            });
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
});
/**
 * @api {get} /wavestats/search/point_id  根据点位图id查询波形统计图
 * @apiDescription 根据点位图id查询波形统计图
 * @apiName 根据点位图id查询波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} point_id 点位图id（外键）
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/search/point_id
 * @apiVersion 1.0.0
 */

router.get("/search/point_id", function (req, res) {
  var point_id = req.query.point_id;
  WaveStatsModel.findOne({
    where: {
      point_id: point_id
    }
  }).then(function (result) {
    res.send({
      status: 200,
      msg: "查询波形统计图成功.",
      data: result
    });
  })["catch"](function (error) {
    console.error("查询波形统计图失败.", error);
    res.send({
      status: 400,
      msg: "查询波形统计图失败."
    });
  });
});
/**
 * @api {get} /wavestats/findAll 获取所有波形统计图
 * @apiDescription 获取所有波形统计图
 * @apiName 获取所有波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 数量
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "获取波形统计图成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/findAll
 * @apiVersion 1.0.0
 */

router.post("/findAll", function _callee3(req, res) {
  var _req$body2, pageNum, pageSize;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body2 = req.body, pageNum = _req$body2.pageNum, pageSize = _req$body2.pageSize;
          _context3.next = 3;
          return regeneratorRuntime.awrap(WaveStatsModel.findAll({
            order: [["create_time", "DESC"]]
          }).then(function (result) {
            if (result) {
              res.send({
                status: 200,
                msg: "获取波形统计图成功.",
                data: utils.pageFilter(result, pageNum, pageSize)
              });
            } else {
              res.send({
                status: 400,
                msg: "获取波形统计图失败."
              });
            }
          })["catch"](function (error) {
            console.error("获取波形统计图失败.", error);
            res.send({
              status: 400,
              msg: "获取波形统计图失败."
            });
          }));

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
});
/**
 * @api {post} /batch/delete 波形统计图批量删除
 * @apiDescription 波形统计图批量删除
 * @apiName 波形统计图批量删除
 * @apiGroup WaveStats
 * @apiBody {Array} wavestatsIds 波形统计图ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "波形统计图批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/batch/delete
 * @apiVersion 1.0.0
 */

router.post("/batch/delete", function _callee4(req, res) {
  var wavestatsIds, data;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          wavestatsIds = req.body.wavestatsIds;

          if (wavestatsIds) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", res.send({
            status: 400,
            msg: "wavestatsIds不可以为空"
          }));

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(WaveStatsModel.findAll({
            where: {
              id: _defineProperty({}, Op["in"], wavestatsIds)
            }
          }));

        case 5:
          data = _context4.sent;
          // 批量删除存储在磁盘的图片
          data.forEach(function (item) {
            fs.unlinkSync(item.path);
          }); // 删除数据库字段

          _context4.next = 9;
          return regeneratorRuntime.awrap(WaveStatsModel.destroy({
            where: {
              id: _defineProperty({}, Op["in"], wavestatsIds)
            }
          }).then(function (result) {
            if (result) {
              res.send({
                status: 200,
                msg: "波形统计图批量删除成功."
              });
            } else {
              res.send({
                status: 400,
                msg: "波形统计图批量删除失败."
              });
            }
          })["catch"](function (err) {
            console.error("波形统计图批量删除失败.", err);
            res.send({
              status: 400,
              msg: "波形统计图批量删除失败."
            });
          }));

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
});
/**
 * @api {get} /wavestats/search 显示图片
 * @apiDescription 显示图片
 * @apiName 显示图片
 * @apiGroup WaveStats
 * @apiParam {String} id 图片id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/search
 * @apiVersion 1.0.0
 */

router.get("/search", function (req, res) {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  var id = req.query.id;
  WaveStatsModel.findOne({
    where: {
      id: id
    }
  }).then(function (img) {
    if (img) {
      // 设置响应头，告诉浏览器这是图片
      res.writeHead(200, {
        "Content-Type": "image/png"
      }); // 创建一个读取图片流

      var stream = fs.createReadStream(img.path); // 声明一个存储数组

      var resData = [];

      if (stream) {
        stream.on("data", function (chunk) {
          resData.push(chunk);
        });
        stream.on("end", function () {
          // 把流存储到缓存池
          var finalData = Buffer.concat(resData); // 响应，写数据

          res.write(finalData);
          res.end();
        });
      }
    }
  })["catch"](function (error) {
    console.error("查询波形统计图失败.", error);
    res.send({
      status: 400,
      msg: "查询波形统计图失败."
    });
  });
});
module.exports = router;