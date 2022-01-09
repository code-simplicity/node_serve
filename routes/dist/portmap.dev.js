"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// 港口地图表
var express = require("express");

var fs = require("fs");

var path = require("path");

var _require = require("sequelize"),
    Op = _require.Op;

var router = express.Router();

var multer = require("multer"); // 导入暴露的模型


var PortMapModel = require("../models/PortMapModel");

var utils = require("../utils/utils"); // 存储在服务器上的,/root/docker/Graduation-Project/uploadUrl


var dirPath = path.join(__dirname, "..", "public/uploadUrl/image/port-map");
var upload = multer({
  dest: dirPath
});
/**
 * @api {post} /portmap/upload 上传港口地图
 * @apiDescription 上传港口地图
 * @apiName 上传港口地图
 * @apiGroup PortMap
 * @apiBody {File} image 图片
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "港口地图上传成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/upload
 * @apiVersion 1.0.0
 */

router.post("/upload", upload.single("image"), function _callee(req, res) {
  var _req$body, name, total, index, size, hash, chunksPath;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("file upload :>> ");
          _req$body = req.body, name = _req$body.name, total = _req$body.total, index = _req$body.index, size = _req$body.size, hash = _req$body.hash; // 判断是否有文件
          // 创建临时的文件块

          chunksPath = path.join(dirPath, hash, "/");

          if (fs.existsSync(chunksPath)) {
            _context.next = 6;
            break;
          }

          _context.next = 6;
          return regeneratorRuntime.awrap(utils.mkdirsSync(chunksPath));

        case 6:
          _context.next = 8;
          return regeneratorRuntime.awrap(fs.renameSync(req.file.path, chunksPath + hash + "-" + index));

        case 8:
          res.send({
            status: 200,
            msg: "分片文件上传成功"
          });

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
}); // 分片合并

router.post("/upload/merge_chunks", function _callee2(req, res) {
  var _req$body2, size, name, total, hash, type, chunksPath, filePath, chunks, i;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, size = _req$body2.size, name = _req$body2.name, total = _req$body2.total, hash = _req$body2.hash, type = _req$body2.type; // 根据hash值，获取分片文件。
          // 创建存储文件
          // 合并

          chunksPath = path.join(dirPath, hash, "/");
          filePath = path.join(dirPath, name); // 读取所有的chunks,文件名存储在数组中,

          chunks = fs.readdirSync(chunksPath);
          console.log("chunks", chunks); // 创建文件存储

          fs.writeFileSync(filePath, "");

          if (!(chunks.length !== total || chunks.length === 0)) {
            _context2.next = 9;
            break;
          }

          res.send.end({
            status: 400,
            msg: "切片文件数量不符合"
          });
          return _context2.abrupt("return");

        case 9:
          for (i = 0; i < total; i++) {
            // 追加写入文件
            fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + "-" + i)); // 删除本次使用的chunks

            fs.unlinkSync(chunksPath + hash + "-" + i);
          } // 同步目录


          fs.rmdirSync(chunksPath); // 保存数据到数据库

          PortMapModel.create({
            url: name,
            path: filePath,
            type: type,
            name: name
          }).then(function (portmap) {
            res.send({
              status: 200,
              msg: "港口地图上传成功.",
              data: portmap
            });
          })["catch"](function (error) {
            console.error("港口地图上传失败.", error);
            res.send({
              status: 400,
              msg: "港口地图上传失败."
            });
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  });
});
/**
 * @api {get} /portmap/delete 删除港口地图
 * @apiDescription 删除港口地图
 * @apiName 删除港口地图
 * @apiGroup PortMap
 * @apiParam {String} id 港口地图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "港口地图删除成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/delete
 * @apiVersion 1.0.0
 */

router.get("/delete", function _callee3(req, res) {
  var id, data;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = req.query.id; // 获取路径

          _context3.next = 3;
          return regeneratorRuntime.awrap(PortMapModel.findOne({
            where: {
              id: id
            }
          }));

        case 3:
          data = _context3.sent;
          // 删除存储在磁盘的图片
          fs.unlinkSync(data.path); // 删除数据库字段，

          PortMapModel.destroy({
            where: {
              id: id
            }
          }).then(function (portmap) {
            res.send({
              status: 200,
              msg: "港口地图删除成功."
            });
          })["catch"](function (error) {
            console.error("港口地图删除失败.", error);
            res.send({
              status: 400,
              msg: "港口地图删除失败."
            });
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});
/**
 * @api {post} /portmap/find 查询港口地图
 * @apiDescription 查询港口地图
 * @apiName 查询港口地图
 * @apiGroup PortMap
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询港口地图成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/find
 * @apiVersion 1.0.0
 */

router.post("/find", function (req, res) {
  var _req$body3 = req.body,
      pageNum = _req$body3.pageNum,
      pageSize = _req$body3.pageSize;
  PortMapModel.findAll({
    order: [["create_time", "DESC"]]
  }).then(function (portmap) {
    res.send({
      status: 200,
      msg: "查询港口地图成功.",
      data: utils.pageFilter(portmap, pageNum, pageSize)
    });
  })["catch"](function (error) {
    console.error("查询港口地图失败.", error);
    res.send({
      status: 400,
      msg: "查询港口地图失败."
    });
  });
});
router.post("/update", upload.single("image"), function _callee4(req, res) {
  var _req$body4, name, total, index, size, hash, chunksPath;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body4 = req.body, name = _req$body4.name, total = _req$body4.total, index = _req$body4.index, size = _req$body4.size, hash = _req$body4.hash; // 判断是否有文件
          // 创建临时的文件块

          chunksPath = path.join(dirPath, hash, "/");

          if (fs.existsSync(chunksPath)) {
            _context4.next = 5;
            break;
          }

          _context4.next = 5;
          return regeneratorRuntime.awrap(utils.mkdirsSync(chunksPath));

        case 5:
          _context4.next = 7;
          return regeneratorRuntime.awrap(fs.renameSync(req.file.path, chunksPath + hash + "-" + index));

        case 7:
          res.send({
            status: 200,
            msg: "分片文件上传成功"
          });

        case 8:
        case "end":
          return _context4.stop();
      }
    }
  });
});
/**
 * @api {post} /portmap/update 修改港口地图
 * @apiDescription 修改港口地图
 * @apiName 修改港口地图
 * @apiGroup PortMap
 * @apiBody {String} id 港口地图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "港口地图修改成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/update
 * @apiVersion 1.0.0
 */
// 分片合并

router.post("/update/merge_chunks", function _callee5(req, res) {
  var _req$body5, size, name, total, hash, type, id, chunksPath, filePath, chunks, i, data;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _req$body5 = req.body, size = _req$body5.size, name = _req$body5.name, total = _req$body5.total, hash = _req$body5.hash, type = _req$body5.type, id = _req$body5.id; // 根据hash值，获取分片文件。
          // 创建存储文件
          // 合并

          chunksPath = path.join(dirPath, hash, "/");
          filePath = path.join(dirPath, name); // 读取所有的chunks,文件名存储在数组中,

          chunks = fs.readdirSync(chunksPath);
          console.log("chunks", chunks); // 创建文件存储

          fs.writeFileSync(filePath, "");

          if (!(chunks.length !== total || chunks.length === 0)) {
            _context5.next = 9;
            break;
          }

          res.send.end({
            status: 400,
            msg: "切片文件数量不符合"
          });
          return _context5.abrupt("return");

        case 9:
          for (i = 0; i < total; i++) {
            // 追加写入文件
            fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + "-" + i)); // 删除本次使用的chunks

            fs.unlinkSync(chunksPath + hash + "-" + i);
          } // 同步目录


          fs.rmdirSync(chunksPath); // 先获取到原来的，再删除

          _context5.next = 13;
          return regeneratorRuntime.awrap(PortMapModel.findOne({
            where: {
              id: id
            }
          }));

        case 13:
          data = _context5.sent;
          fs.unlinkSync(data.path); // 再修改相关信息

          PortMapModel.update({
            url: name,
            path: filePath,
            type: type,
            name: name
          }, {
            where: {
              id: id
            }
          }).then(function (portmap) {
            if (portmap) {
              res.send({
                status: 200,
                msg: "港口地图修改成功."
              });
            }
          })["catch"](function (error) {
            console.error("港口地图修改失败.", error);
            res.send({
              status: 200,
              msg: "港口地图修改失败."
            });
          });

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  });
});
/**
 * @api {post} /portmap/batch/delete 港口地图批量删除
 * @apiDescription 港口地图批量删除
 * @apiName 港口地图批量删除
 * @apiGroup PortMap
 * @apiBody {Array} portmapIds 港口地图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "港口地图批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/batch/delete
 * @apiVersion 1.0.0
 */

router.post("/batch/delete", function _callee6(req, res) {
  var portmapIds;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          portmapIds = req.body.portmapIds;

          if (portmapIds) {
            _context6.next = 3;
            break;
          }

          return _context6.abrupt("return", res.send({
            status: 400,
            msg: "portmapIds不可以为空"
          }));

        case 3:
          _context6.next = 5;
          return regeneratorRuntime.awrap(PortMapModel.destroy({
            where: {
              id: _defineProperty({}, Op["in"], portmapIds)
            }
          }).then(function (portmap) {
            if (portmap) {
              res.send({
                status: 200,
                msg: "港口地图批量删除成功."
              });
            } else {
              res.send({
                status: 400,
                msg: "港口地图批量删除失败."
              });
            }
          })["catch"](function (err) {
            console.error("港口地图批量删除失败.", err);
            res.send({
              status: 400,
              msg: "港口地图批量删除失败."
            });
          }));

        case 5:
        case "end":
          return _context6.stop();
      }
    }
  });
});
/**
 * @api {get} /portmap/search 搜索图片
 * @apiDescription 搜索图片
 * @apiName 搜索图片
 * @apiGroup PortMap
 * @apiParam {String} id 图片id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/search
 * @apiVersion 1.0.0
 */

router.get("/search", function (req, res) {
  try {
    // 查询图片
    // 首先查询存储的位置，
    // 通过文件流的形式将图片读写
    var id = req.query.id;
    PortMapModel.findOne({
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
    });
  } catch (error) {
    console.error("查询港口点位图失败.", error);
    res.send({
      status: 400,
      msg: "查询港口点位图失败."
    });
  }
});
module.exports = router;