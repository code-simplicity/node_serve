// 获取视频
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const multer = require("multer");

const VideoModel = require("../models/VideoModel");
const { Op } = require("sequelize");

const utils = require("../utils/utils");
// const { uploadUrl } = require("../config/config");

// 文件上传到服务器的路径,存储在本地的
// const dirPath = path.join(uploadUrl + "/video/" + utils.getNowFormatDate());
const dirPath = path.join(
  __dirname,
  "..",
  "public/uploadUrl/video/" + utils.getNowFormatDate()
);

// 创建图片保存的路径,绝对路径
// 配置规则 配置目录/类型/原名称.类型
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, (err) => {
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
  filename: function (req, file, cb) {
    console.log("filename()", file);
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
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
router.post("/upload", upload.single("video"), (req, res) => {
  const { water_level, wave_direction, embank_ment } = req.body;
  const file = req.file;
  console.log(`file`, file);
  if (!file) {
    res.send({
      status: 400,
      msg: "视频不能为空.",
    });
  }
  // 获取文件类型是video/mp4还是其他
  const fileTyppe = file.mimetype;
  // 先读取这个文件
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
      url: `${file.originalname}`,
      path: file.path,
      type: fileTyppe,
      name: `${file.originalname}`,
      water_level: water_level,
      wave_direction: wave_direction,
      embank_ment: embank_ment,
    }).then((video) => {
      if (video) {
        res.send({
          status: 200,
          msg: "视频上传服务器成功.",
          data: video,
        });
      } else {
        res.send({
          status: 400,
          msg: "视视频上传失败.",
        });
      }
    });
  } catch (error) {
    console.error("视频上传失败.", error);
    res.send({
      status: 400,
      msg: "视视频上传失败.",
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
router.post("/serach", (req, res) => {
  const { water_level, wave_direction, embank_ment } = req.body;
  VideoModel.findOne({
    where: {
      [Op.and]: [
        {
          water_level: water_level,
        },
        {
          wave_direction: wave_direction,
        },
        {
          embank_ment: embank_ment,
        },
      ],
    },
  })
    .then((video) => {
      if (video) {
        res.send({
          status: 200,
          msg: "查询视频成功.",
          data: video,
        });
      } else {
        res.send({
          status: 400,
          msg: "查询视频失败，请重试！",
        });
      }
    })
    .catch((error) => {
      console.error("查询视频失败", error);
      res.send({
        status: 400,
        msg: "查询视频失败，请重试！",
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
router.get("/delete", (req, res) => {
  const { id } = req.query;
  VideoModel.destroy({
    where: {
      id,
    },
  })
    .then((video) => {
      if (video) {
        res.send({
          status: 200,
          msg: "删除视频成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "删除视频失败,请重试！",
        });
      }
    })
    .catch((error) => {
      console.error("删除视频失败.", error);
      res.send({
        status: 400,
        msg: "删除视频失败,请重试！",
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
router.get("/search/one", (req, res) => {
  // 通过视频名称查看
  const { name } = req.query;
  VideoModel.findOne({
    where: {
      name: name,
    },
  })
    .then((video) => {
      res.send({
        status: 200,
        msg: "查询港区漫游视频成功.",
        data: video,
      });
    })
    .catch((error) => {
      console.error("查询港区漫游视频失败.", error);
      res.send({
        status: 400,
        msg: "查询港区漫游视频失败.",
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
router.post("/findAll", (req, res) => {
  const { pageNum, pageSize } = req.body;
  VideoModel.findAll({ order: [["create_time"]] })
    .then((video) => {
      if (video) {
        res.send({
          status: 200,
          msg: "获取港区漫游视频成功.",
          data: utils.pageFilter(video, pageNum, pageSize),
        });
      } else {
        res.send({
          status: 400,
          msg: "获取港区漫游视频失败.",
        });
      }
    })
    .catch((error) => {
      console.error("获取港区漫游视频失败.", error);
      res.send({
        status: 400,
        msg: "获取港区漫游视频失败.",
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
router.post("/update", upload.single("video"), (req, res) => {
  const { water_level, wave_direction, embank_ment, id } = req.body;
  const file = req.file;
  console.log(`file`, file);
  if (file === null) {
    res.send({
      status: 400,
      msg: "视频不能为空.",
    });
  }
  // 获取文件类型是video/mp4还是其他
  const fileTyppe = file.mimetype;
  VideoModel.update(
    {
      url: `${file.originalname}`,
      path: "/video/" + file.originalname,
      type: fileTyppe,
      name: `${file.originalname}`,
      water_level: water_level,
      wave_direction: wave_direction,
      embank_ment: embank_ment,
    },
    {
      where: {
        id,
      },
    }
  )
    .then((video) => {
      if (video) {
        res.send({
          status: 200,
          msg: "视频信息修改成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "视视信息修改失败.",
        });
      }
    })
    .catch((error) => {
      console.error("视频信息修改失败.", error);
      res.send({
        status: 400,
        msg: "视视信息修改失败.",
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
router.post("/batch/delete", async (req, res) => {
  const { videoIds } = req.body;
  if (!videoIds) {
    return res.send({
      status: 400,
      msg: "videoIds不可以为空",
    });
  }
  await VideoModel.destroy({
    where: {
      id: {
        [Op.in]: videoIds,
      },
    },
  })
    .then((video) => {
      if (video) {
        res.send({
          status: 200,
          msg: "视频批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "视频批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("视频批量删除失败.", err);
      res.send({
        status: 400,
        msg: "视频批量删除失败.",
      });
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
router.get("/search", (req, res) => {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  const { id } = req.query;
  VideoModel.findOne({
    where: {
      id,
    },
  })
    .then((video) => {
      if (video) {
        // 设置响应头，告诉浏览器这是视频
        let head = {
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        // 创建一个读取图片流
        const stream = fs.createReadStream(video.path);
        // 使用管道传输视频
        stream.pipe(res);
      }
    })
    .catch((error) => {
      console.error("查询视频失败.", error);
      res.send({
        status: 400,
        msg: "查询视频失败.",
      });
    });
});
module.exports = router;
