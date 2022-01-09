// 获取视频
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const multer = require("multer");

const VideoModel = require("../models/VideoModel");
const { Op } = require("sequelize");

const utils = require("../utils/utils");

// 文件上传到服务器的路径,存储在本地的
// const dirPath = path.join(uploadUrl + "/video/" + utils.getNowFormatDate());

const dirPath = path.join(__dirname, "..", "public/uploadUrl/video");
const upload = multer({ dest: dirPath });

// 创建图片保存的路径,绝对路径
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
router.post("/upload", upload.single("video"), async (req, res) => {
  console.log("file upload :>> ");
  const { name, total, index, size, hash } = req.body;
  // 判断是否有文件
  // 创建临时的文件块
  const chunksPath = path.join(dirPath, hash, "/");
  if (!fs.existsSync(chunksPath)) {
    await utils.mkdirsSync(chunksPath);
  }
  // 文件重命名
  await fs.renameSync(req.file.path, chunksPath + hash + "-" + index);
  res.send({
    status: 200,
    msg: "分片文件上传成功",
  });
});

// 分片合并
router.post("/upload/merge_chunks", async (req, res) => {
  const {
    size,
    name,
    total,
    hash,
    type,
    water_level,
    wave_direction,
    embank_ment,
  } = req.body;
  // 根据hash值，获取分片文件。
  // 创建存储文件
  // 合并
  const chunksPath = path.join(dirPath, hash, "/");
  const filePath = path.join(dirPath, name);
  // 读取所有的chunks,文件名存储在数组中,
  const chunks = fs.readdirSync(chunksPath);
  console.log("chunks", chunks);
  // 创建文件存储
  fs.writeFileSync(filePath, "");
  if (chunks.length !== total || chunks.length === 0) {
    res.send.end({
      status: 400,
      msg: "切片文件数量不符合",
    });
    return;
  }
  for (let i = 0; i < total; i++) {
    // 追加写入文件
    fs.appendFileSync(filePath, fs.readFileSync(chunksPath + hash + "-" + i));
    // 删除本次使用的chunks
    fs.unlinkSync(chunksPath + hash + "-" + i);
  }
  // 同步目录
  fs.rmdirSync(chunksPath);
  // 保存数据到数据库
  VideoModel.create({
    url: name,
    path: filePath,
    type: type,
    name: name,
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
router.get("/delete", async (req, res) => {
  const { id } = req.query;
  // 获取路径
  const data = await VideoModel.findOne({
    where: {
      id,
    },
  });
  // 删除存储在磁盘的视频
  fs.unlinkSync(data.path);
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
router.post("/update", upload.single("video"), async (req, res) => {
  const { water_level, wave_direction, embank_ment, id } = req.body;
  const file = req.file;
  console.log(`file`, file);
  if (file === null) {
    res.send({
      status: 400,
      msg: "视频不能为空.",
    });
  }
  // 获取路径
  const data = await VideoModel.findOne({
    where: {
      id,
    },
  });
  // 删除存储在磁盘的图片
  fs.unlinkSync(data.path);
  VideoModel.update(
    {
      url: file.originalname,
      path: file.path,
      type: file.mimetype,
      name: file.originalname,
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
  // 获取路径
  const data = await VideoModel.findAll({
    where: {
      id: {
        [Op.in]: videoIds,
      },
    },
  });
  // 删除存储在磁盘的图片
  data.forEach((item) => {
    fs.unlinkSync(item.path);
  });
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
