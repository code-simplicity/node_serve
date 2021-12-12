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

var utils = require("../utils/utils"); // const { uploadUrl } = require("../config/config");
// 文件上传到服务器的路径,存储在本地的
// const dirPath = path.join(uploadUrl + "/video/" + utils.getNowFormatDate());


var dirPath = path.join(__dirname, "..", "public/uploadUrl/video/" + utils.getNowFormatDate()); // 创建图片保存的路径,绝对路径
// 配置规则 配置目录/类型/原名称.类型

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, function (err) {
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

router.post("/upload", upload.single("video"), function (req, res) {
  var _req$body = req.body,
      water_level = _req$body.water_level,
      wave_direction = _req$body.wave_direction,
      embank_ment = _req$body.embank_ment;
  var file = req.file;
  console.log("file", file);

  if (!file) {
    res.send({
      status: 400,
      msg: "视频不能为空."
    });
  } // 获取文件类型是video/mp4还是其他


  var fileTyppe = file.mimetype; // 先读取这个文件
  // fs.readFile(file.path, "utf-8", function (err, data) {
  //   if (err) {
  //     return;
  //   } else {
  //     fs.writeFile(file.originalname, "utf-8", data, function (err) {
  //       if (err) {
  //         return;
  //       } else {
  //         console.log("视频写入成功");
  //       }
  //     });
  //   }
  // });

  try {
    VideoModel.create({
      url: "".concat(file.originalname),
      path: file.path,
      type: fileTyppe,
      name: "".concat(file.originalname),
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
  } catch (error) {
    console.error("视频上传失败.", error);
    res.send({
      status: 400,
      msg: "视视频上传失败."
    });
  }
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
  var _req$body2 = req.body,
      water_level = _req$body2.water_level,
      wave_direction = _req$body2.wave_direction,
      embank_ment = _req$body2.embank_ment;
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

router.get("/delete", function (req, res) {
  var id = req.query.id;
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
  var _req$body3 = req.body,
      pageNum = _req$body3.pageNum,
      pageSize = _req$body3.pageSize;
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

router.post("/update", upload.single("video"), function (req, res) {
  var _req$body4 = req.body,
      water_level = _req$body4.water_level,
      wave_direction = _req$body4.wave_direction,
      embank_ment = _req$body4.embank_ment,
      id = _req$body4.id;
  var file = req.file;
  console.log("file", file);

  if (file === null) {
    res.send({
      status: 400,
      msg: "视频不能为空."
    });
  } // 获取文件类型是video/mp4还是其他


  var fileTyppe = file.mimetype;
  VideoModel.update({
    url: "".concat(file.originalname),
    path: "/video/" + file.originalname,
    type: fileTyppe,
    name: "".concat(file.originalname),
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

router.post("/batch/delete", function _callee(req, res) {
  var videoIds;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          videoIds = req.body.videoIds;

          if (videoIds) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.send({
            status: 400,
            msg: "videoIds不可以为空"
          }));

        case 3:
          _context.next = 5;
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

        case 5:
        case "end":
          return _context.stop();
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