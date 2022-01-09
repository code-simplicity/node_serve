"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// 港口点位地图表
var express = require("express");

var fs = require("fs");

var path = require("path");

var _require = require("sequelize"),
    Op = _require.Op;

var router = express.Router();

var multer = require("multer");

var utils = require("../utils/utils"); // 导入暴露的模型


var PortPointMapModel = require("../models/PortPointMapModel"); // 存储在服务器上的,/root/docker/Graduation-Project/uploadUrl
// const dirPath = uploadUrl + "/image/port-point-map/" + utils.getNowFormatDate();


var dirPath = path.join(__dirname, "..", "public/uploadUrl/image/port-point-map");
var upload = multer({
  dest: dirPath
});
/**
 * @api {post} /portpointmap/upload 上传图片到服务器，保留数据在数据库
 * @apiDescription 上传图片到服务器
 * @apiName 上传图片到服务器
 * @apiGroup PortPointMap
 * @apiBody {File} image 图片
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/upload
 * @apiVersion 1.0.0
 */

router.post("/upload", upload.single("image"), function _callee(req, res) {
  var _req$body, name, total, index, size, hash, chunksPath;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, name = _req$body.name, total = _req$body.total, index = _req$body.index, size = _req$body.size, hash = _req$body.hash; // 判断是否有文件
          // 创建临时的文件块

          chunksPath = path.join(dirPath, hash, "/");

          if (fs.existsSync(chunksPath)) {
            _context.next = 5;
            break;
          }

          _context.next = 5;
          return regeneratorRuntime.awrap(utils.mkdirsSync(chunksPath));

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(fs.renameSync(req.file.path, chunksPath + hash + "-" + index));

        case 7:
          res.send({
            status: 200,
            msg: "分片文件上传成功"
          });

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}); // 分片合并

router.post("/upload/merge_chunks", function _callee2(req, res) {
  var _req$body2, size, name, total, hash, type, water_level, wave_direction, embank_ment, chunksPath, filePath, chunks, i;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, size = _req$body2.size, name = _req$body2.name, total = _req$body2.total, hash = _req$body2.hash, type = _req$body2.type, water_level = _req$body2.water_level, wave_direction = _req$body2.wave_direction, embank_ment = _req$body2.embank_ment; // 根据hash值，获取分片文件。
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

          PortPointMapModel.create({
            url: name,
            path: filePath,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment
          }).then(function (img) {
            res.send({
              status: 200,
              msg: "图片上传服务器成功.",
              data: img
            });
          })["catch"](function (error) {
            console.error("图片上传失败.", error);
            res.send({
              status: 400,
              msg: "图片上传失败."
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
 * @api {post} /portpointmap/search 搜索图片
 * @apiDescription 搜索图片
 * @apiName 搜索图片
 * @apiGroup PortPointMap
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 每页数量
 * @apiBody {String} water_level 水位高低
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 外堤布置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/search
 * @apiVersion 1.0.0
 */

router.post("/search", function (req, res) {
  // 通过水位，波浪来向，堤坝布置查询图片
  var _req$body3 = req.body,
      water_level = _req$body3.water_level,
      wave_direction = _req$body3.wave_direction,
      embank_ment = _req$body3.embank_ment,
      pageNum = _req$body3.pageNum,
      pageSize = _req$body3.pageSize;
  PortPointMapModel.findAll({
    where: _defineProperty({}, Op.and, [{
      water_level: water_level ? water_level : ""
    }, {
      wave_direction: wave_direction ? wave_direction : ""
    }, {
      embank_ment: embank_ment ? embank_ment : ""
    }])
  }).then(function (img) {
    if (img) {
      res.send({
        status: 200,
        msg: "查询港口点位图成功.",
        data: utils.pageFilter(img, pageNum, pageSize)
      });
    } else {
      res.send({
        status: 400,
        msg: "查询港口点位图失败."
      });
    }
  })["catch"](function (error) {
    console.error("查询港口点位图失败.", error);
    res.send({
      status: 400,
      msg: "查询港口点位图失败."
    });
  });
});
/**
 * @api {post} /portpointmap/findAll 查询所有图片列表
 * @apiDescription 查询所有图片列表
 * @apiName 查询所有图片列表
 * @apiGroup PortPointMap
 * @apiBody {String} water_level 水位高低
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 外堤布置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/findAll
 * @apiVersion 1.0.0
 */

router.post("/findAll", function _callee3(req, res) {
  var _req$body4, pageNum, pageSize, result;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body4 = req.body, pageNum = _req$body4.pageNum, pageSize = _req$body4.pageSize;
          _context3.next = 4;
          return regeneratorRuntime.awrap(PortPointMapModel.findAll({
            order: [["create_time", "DESC"]]
          }));

        case 4:
          result = _context3.sent;

          if (result.length > 0) {
            if (pageNum && pageSize) {
              res.send({
                status: 200,
                msg: "查询成功.",
                data: utils.pageFilter(result, pageNum, pageSize)
              });
            } else {
              res.send({
                status: 200,
                msg: "查询成功.",
                data: result
              });
            }
          }

          _context3.next = 12;
          break;

        case 8:
          _context3.prev = 8;
          _context3.t0 = _context3["catch"](0);
          console.error("查询失败.", _context3.t0);
          res.send({
            status: 400,
            msg: "查询失败."
          });

        case 12:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 8]]);
});
/**
 * @api {post} /portpointmap/delete 删除图片
 * @apiDescription 删除图片
 * @apiName 删除图片
 * @apiGroup PortPointMap
 * @apiParam {String} id 图片id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/delete
 * @apiVersion 1.0.0
 */

router.get("/delete", function _callee4(req, res) {
  var id, data;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = req.query.id; // 获取路径

          _context4.next = 3;
          return regeneratorRuntime.awrap(PortPointMapModel.findOne({
            where: {
              id: id
            }
          }));

        case 3:
          data = _context4.sent;
          // 删除存储在磁盘的图片
          fs.unlinkSync(data.path);
          PortPointMapModel.destroy({
            where: {
              id: id
            }
          }).then(function (img) {
            if (img) {
              res.send({
                status: 200,
                msg: "删除图片成功."
              });
            } else {
              res.send({
                status: 200,
                msg: "图片不存在或者已经删除."
              });
            }
          })["catch"](function (error) {
            console.error("删除图片失败.", error);
            res.send({
              status: 400,
              msg: "删除图片失败."
            });
          });

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  });
});
router.post("/update", upload.single("image"), function _callee5(req, res) {
  var _req$body5, name, total, index, size, hash, chunksPath;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _req$body5 = req.body, name = _req$body5.name, total = _req$body5.total, index = _req$body5.index, size = _req$body5.size, hash = _req$body5.hash; // 判断是否有文件
          // 创建临时的文件块

          chunksPath = path.join(dirPath, hash, "/");

          if (fs.existsSync(chunksPath)) {
            _context5.next = 5;
            break;
          }

          _context5.next = 5;
          return regeneratorRuntime.awrap(utils.mkdirsSync(chunksPath));

        case 5:
          _context5.next = 7;
          return regeneratorRuntime.awrap(fs.renameSync(req.file.path, chunksPath + hash + "-" + index));

        case 7:
          res.send({
            status: 200,
            msg: "分片文件上传成功"
          });

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
});
/**
 * @api {post} /portpointmap/update 修改图片信息
 * @apiDescription 修改图片信息
 * @apiName 修改图片信息
 * @apiGroup PortPointMap
 * @apiBody {String} id 图片id
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片修改成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/update
 * @apiVersion 1.0.0
 */
// 分片合并

router.post("/update/merge_chunks", function _callee6(req, res) {
  var _req$body6, size, name, total, hash, type, water_level, wave_direction, embank_ment, id, chunksPath, filePath, chunks, i, data;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$body6 = req.body, size = _req$body6.size, name = _req$body6.name, total = _req$body6.total, hash = _req$body6.hash, type = _req$body6.type, water_level = _req$body6.water_level, wave_direction = _req$body6.wave_direction, embank_ment = _req$body6.embank_ment, id = _req$body6.id; // 根据hash值，获取分片文件。
          // 创建存储文件
          // 合并

          chunksPath = path.join(dirPath, hash, "/");
          filePath = path.join(dirPath, name); // 读取所有的chunks,文件名存储在数组中,

          chunks = fs.readdirSync(chunksPath);
          console.log("chunks", chunks); // 创建文件存储

          fs.writeFileSync(filePath, "");

          if (!(chunks.length !== total || chunks.length === 0)) {
            _context6.next = 9;
            break;
          }

          res.send.end({
            status: 400,
            msg: "切片文件数量不符合"
          });
          return _context6.abrupt("return");

        case 9:
          for (i = 0; i < total; i++) {
            // 追加写入文件
            fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + "-" + i)); // 删除本次使用的chunks

            fs.unlinkSync(chunksPath + hash + "-" + i);
          } // 同步目录


          fs.rmdirSync(chunksPath); // 先获取到原来的，再删除

          _context6.next = 13;
          return regeneratorRuntime.awrap(PortMapModel.findOne({
            where: {
              id: id
            }
          }));

        case 13:
          data = _context6.sent;
          fs.unlinkSync(data.path); // 再修改相关信息

          _context6.next = 17;
          return regeneratorRuntime.awrap(PortPointMapModel.update({
            url: name,
            path: filePath,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment
          }, {
            where: {
              id: id
            }
          }).then(function (img) {
            if (img) {
              res.send({
                status: 200,
                msg: "港修改港口点位图信息成功."
              });
            }
          })["catch"](function (error) {
            console.error("修改图片信息失败.", error);
            res.send({
              status: 200,
              msg: "修改图片信息失败."
            });
          }));

        case 17:
        case "end":
          return _context6.stop();
      }
    }
  });
});
/**
 * @api {post} /portpointmap/batch/delete 港口点位图批量删除
 * @apiDescription 港口点位图批量删除
 * @apiName 港口点位图批量删除
 * @apiGroup PortPointMap
 * @apiBody {Array} portpointmapIds 港口点位ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "视视频删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/batch/delete
 * @apiVersion 1.0.0
 */

router.post("/batch/delete", function _callee7(req, res) {
  var portpointmapIds;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          portpointmapIds = req.body.portpointmapIds;

          if (portpointmapIds) {
            _context7.next = 3;
            break;
          }

          return _context7.abrupt("return", res.send({
            status: 400,
            msg: "portpointmapIds不可以为空"
          }));

        case 3:
          _context7.next = 5;
          return regeneratorRuntime.awrap(PortPointMapModel.destroy({
            where: {
              id: _defineProperty({}, Op["in"], portpointmapIds)
            }
          }).then(function (img) {
            if (img) {
              res.send({
                status: 200,
                msg: "港口点位图批量删除成功."
              });
            } else {
              res.send({
                status: 400,
                msg: "港口点位图批量删除失败."
              });
            }
          })["catch"](function (err) {
            console.error("港口点位图批量删除失败.", err);
            res.send({
              status: 400,
              msg: "港口点位图批量删除失败."
            });
          }));

        case 5:
        case "end":
          return _context7.stop();
      }
    }
  });
});
/**
 * @api {get} /portpointmap/search 显示图片
 * @apiDescription 显示图片
 * @apiName 显示图片
 * @apiGroup PortPointMap
 * @apiParam {String} id 图片id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/search
 * @apiVersion 1.0.0
 */

router.get("/search", function (req, res) {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  var id = req.query.id;
  PortPointMapModel.findOne({
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
    console.error("查询港口点位图失败.", error);
    res.send({
      status: 400,
      msg: "查询港口点位图失败."
    });
  });
});
module.exports = router;