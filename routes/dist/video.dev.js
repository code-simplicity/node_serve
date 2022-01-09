"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// 获取视频
var express = require("express");

var fs = require("fs");

var path = require("path");

var router = express.Router();

var multer = require("multer");

var VideoModel = require("../models/VideoModel");

var _require = require("sequelize"),
    Op = _require.Op;

var utils = require("../utils/utils"); // 文件上传到服务器的路径,存储在本地的
// const dirPath = path.join(uploadUrl + "/video/" + utils.getNowFormatDate());


var dirPath = path.join(__dirname, "..", "public/uploadUrl/video");
var upload = multer({
  dest: dirPath
}); // 创建图片保存的路径,绝对路径
// 配置规则 配置目录/类型/原名称.类型

/**
 * @api {post} /video/upload 上传视频到服务器
 * @apiDescription 上传视频到服务器
 * @apiName 上传视频到服务器
 * @apiGroup Video
 * @apiBody {File} video 视频
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "视频上传服务器成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/upload
 * @apiVersion 1.0.0
 */

router.post("/upload", upload.single("video"), function _callee(req, res) {
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

          VideoModel.create({
            url: name,
            path: filePath,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment
          }).then(function (video) {
            if (video) {
              res.send({
                status: 200,
                msg: "视频上传服务器成功.",
                data: video
              });
            } else {
              res.send({
                status: 400,
                msg: "视视频上传失败."
              });
            }
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  });
});
/**
 * @api {post} /video/serach 查询视频
 * @apiDescription 查询视频
 * @apiName 查询视频
 * @apiGroup Video
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询视频成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/serach
 * @apiVersion 1.0.0
 */

router.post("/serach", function (req, res) {
  var _req$body3 = req.body,
      water_level = _req$body3.water_level,
      wave_direction = _req$body3.wave_direction,
      embank_ment = _req$body3.embank_ment;
  VideoModel.findOne({
    where: _defineProperty({}, Op.and, [{
      water_level: water_level
    }, {
      wave_direction: wave_direction
    }, {
      embank_ment: embank_ment
    }])
  }).then(function (video) {
    if (video) {
      res.send({
        status: 200,
        msg: "查询视频成功.",
        data: video
      });
    } else {
      res.send({
        status: 400,
        msg: "查询视频失败，请重试！"
      });
    }
  })["catch"](function (error) {
    console.error("查询视频失败", error);
    res.send({
      status: 400,
      msg: "查询视频失败，请重试！"
    });
  });
});
/**
 * @api {get} /video/delete 删除上传的视频
 * @apiDescription 删除上传的视频
 * @apiName 删除上传的视频
 * @apiGroup Video
 * @apiParam {String} id 水位
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "删除视频成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/video/delete
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
          return regeneratorRuntime.awrap(VideoModel.findOne({
            where: {
              id: id
            }
          }));

        case 3:
          data = _context3.sent;
          // 删除存储在磁盘的视频
          fs.unlinkSync(data.path);
          VideoModel.destroy({
            where: {
              id: id
            }
          }).then(function (video) {
            if (video) {
              res.send({
                status: 200,
                msg: "删除视频成功."
              });
            } else {
              res.send({
                status: 400,
                msg: "删除视频失败,请重试！"
              });
            }
          })["catch"](function (error) {
            console.error("删除视频失败.", error);
            res.send({
              status: 400,
              msg: "删除视频失败,请重试！"
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
 * @api {get} /video/search/one 获取港区漫游的视频
 * @apiDescription 获取港区漫游的视频
 * @apiName 获取港区漫游的视频
 * @apiGroup Video
 * @apiParam {String} name 港区漫游的视频名称
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询港区漫游视频成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/search/one
 * @apiVersion 1.0.0
 */

router.get("/search/one", function (req, res) {
  // 通过视频名称查看
  var name = req.query.name;
  VideoModel.findOne({
    where: {
      name: name
    }
  }).then(function (video) {
    res.send({
      status: 200,
      msg: "查询港区漫游视频成功.",
      data: video
    });
  })["catch"](function (error) {
    console.error("查询港区漫游视频失败.", error);
    res.send({
      status: 400,
      msg: "查询港区漫游视频失败."
    });
  });
});
/**
 * @api {post} /video/findAll 获取所有视频
 * @apiDescription 获取所有视频
 * @apiName 获取所有视频
 * @apiGroup Video
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 每页数量
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "获取港区漫游视频成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/findAll
 * @apiVersion 1.0.0
 */

router.post("/findAll", function (req, res) {
  var _req$body4 = req.body,
      pageNum = _req$body4.pageNum,
      pageSize = _req$body4.pageSize;
  VideoModel.findAll({
    order: [["create_time"]]
  }).then(function (video) {
    if (video) {
      res.send({
        status: 200,
        msg: "获取港区漫游视频成功.",
        data: utils.pageFilter(video, pageNum, pageSize)
      });
    } else {
      res.send({
        status: 400,
        msg: "获取港区漫游视频失败."
      });
    }
  })["catch"](function (error) {
    console.error("获取港区漫游视频失败.", error);
    res.send({
      status: 400,
      msg: "获取港区漫游视频失败."
    });
  });
});
/**
 * @api {post} /video/update 修改视频信息
 * @apiDescription 修改视频信息
 * @apiName 修改视频信息
 * @apiGroup Video
 * @apiBody {File} video 视频
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "视频上传服务器成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/update
 * @apiVersion 1.0.0
 */

router.post("/update", upload.single("video"), function _callee4(req, res) {
  var _req$body5, water_level, wave_direction, embank_ment, id, file, data;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body5 = req.body, water_level = _req$body5.water_level, wave_direction = _req$body5.wave_direction, embank_ment = _req$body5.embank_ment, id = _req$body5.id;
          file = req.file;
          console.log("file", file);

          if (file === null) {
            res.send({
              status: 400,
              msg: "视频不能为空."
            });
          } // 获取路径


          _context4.next = 6;
          return regeneratorRuntime.awrap(VideoModel.findOne({
            where: {
              id: id
            }
          }));

        case 6:
          data = _context4.sent;
          // 删除存储在磁盘的图片
          fs.unlinkSync(data.path);
          VideoModel.update({
            url: file.originalname,
            path: file.path,
            type: file.mimetype,
            name: file.originalname,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment
          }, {
            where: {
              id: id
            }
          }).then(function (video) {
            if (video) {
              res.send({
                status: 200,
                msg: "视频信息修改成功."
              });
            } else {
              res.send({
                status: 400,
                msg: "视视信息修改失败."
              });
            }
          })["catch"](function (error) {
            console.error("视频信息修改失败.", error);
            res.send({
              status: 400,
              msg: "视视信息修改失败."
            });
          });

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
});
/**
 * @api {post} /batch/delete 视频批量删除
 * @apiDescription 视频批量删除
 * @apiName 视频批量删除
 * @apiGroup Video
 * @apiBody {Array} ids 视频ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "视频删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/video/batch/delete
 * @apiVersion 1.0.0
 */

router.post("/batch/delete", function _callee5(req, res) {
  var videoIds, data;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          videoIds = req.body.videoIds;

          if (videoIds) {
            _context5.next = 3;
            break;
          }

          return _context5.abrupt("return", res.send({
            status: 400,
            msg: "videoIds不可以为空"
          }));

        case 3:
          _context5.next = 5;
          return regeneratorRuntime.awrap(VideoModel.findAll({
            where: {
              id: _defineProperty({}, Op["in"], videoIds)
            }
          }));

        case 5:
          data = _context5.sent;
          // 删除存储在磁盘的图片
          data.forEach(function (item) {
            fs.unlinkSync(item.path);
          });
          _context5.next = 9;
          return regeneratorRuntime.awrap(VideoModel.destroy({
            where: {
              id: _defineProperty({}, Op["in"], videoIds)
            }
          }).then(function (video) {
            if (video) {
              res.send({
                status: 200,
                msg: "视频批量删除成功."
              });
            } else {
              res.send({
                status: 400,
                msg: "视频批量删除失败."
              });
            }
          })["catch"](function (err) {
            console.error("视频批量删除失败.", err);
            res.send({
              status: 400,
              msg: "视频批量删除失败."
            });
          }));

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  });
});
/**
 * @api {get} /video/search 显示视频
 * @apiDescription 显示视频
 * @apiName 显示视频
 * @apiGroup Video
 * @apiParam {String} id 视频id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/video/search
 * @apiVersion 1.0.0
 */

router.get("/search", function (req, res) {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  var id = req.query.id;
  VideoModel.findOne({
    where: {
      id: id
    }
  }).then(function (video) {
    if (video) {
      // 设置响应头，告诉浏览器这是视频
      var head = {
        "Content-Type": "video/mp4"
      };
      res.writeHead(200, head); // 创建一个读取图片流

      var stream = fs.createReadStream(video.path); // 使用管道传输视频

      stream.pipe(res);
    }
  })["catch"](function (error) {
    console.error("查询视频失败.", error);
    res.send({
      status: 400,
      msg: "查询视频失败."
    });
  });
});
module.exports = router;