// 获取视频
const express = require("express");
const fs = require("fs");
const path = require("path");
// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');

const router = express.Router();

const multer = require("multer");

const VideoModel = require("../models/VideoModel");
const {
  Op
} = require("sequelize");

const utils = require("../utils/utils");

const R = require("../utils/R")

// 引入常量
const Constants = require("../utils/Constants")

// 创建对象存储实例
const cos = new COS({
  SecretId: Constants.txCosConfig.SecretId,
  SecretKey: Constants.txCosConfig.SecretKey,
})

// 存储路径
const dirPath = path.join("./");
const upload = multer({
  dest: dirPath
});

// 创建cos上传存储的位置
const uploadUrl = "node-serve/video/"

/**
 * 上传港口地图
 */
router.post("/upload", upload.single("video"), async (req, res) => {
  /**
   * filename：是文件名的hash，"8e7c4c36a823cd4bd9508167cfc679a6"
   * mimetype 文件类型：'image/png'
   * originalname：原来的名字
   */
  const {
    filename,
    mimetype,
    originalname
  } = req.file

  const {
    water_level,
    wave_direction,
    embank_ment,
  } =
  req.body;

  // 视频重命名
  await fs.rename(filename, originalname, (error) => {
    if (error) {
      return res.send(R.fail("视频重命名失败."))
    } else {
      // 上传文件的路径
      const localFile = dirPath + originalname
      const key = uploadUrl + originalname
      // 腾讯云上传文件
      const params = {
        Bucket: Constants.txCosConfig.Bucket,
        Region: Constants.txCosConfig.Region,
        // 上传文件执行的目录，作为key存在
        Key: key,
        // 上传文件路径
        FilePath: localFile,
        // 表示文件大小超出一个数值时使用分块上传
        SliceSize: 1024 * 1024 * 6,
        AsyncLimit: 10 // 分块并发量
      }
      let result = {}
      // 上传任务的回调
      let taskStatus = ""
      // 上传进度的对象
      let onHashProgress = {}
      let onProgress = {}
      cos.sliceUploadFile({
        ...params,
        // 上传任务创建时的回调函数，返回一个 taskId，
        // 唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）
        onTaskReady: (taskId) => {
          taskStatus = taskId
        },
        // 计算文件 MD5 值的进度回调函数，回调参数为进度对象 progressData
        onHashProgress: (progressData) => {
          onHashProgress = progressData
        },
        // 上传文件的进度回调函数，回调参数为进度对象 progressData
        onProgress: (progressData) => {
          onProgress = progressData
        }
      }, async (err, data) => {
        try {
          if (err) {
            return res.send(R.fail("视频上传服务器失败."))
          } else {
            // 首先删除上传到本地的文件
            fs.unlinkSync(localFile)
            // 保存图片信息到相关表格中
            result = {
              taskStatus,
              onHashProgress: onHashProgress,
              onProgress: onProgress
            }
            const {
              dataValues
            } = await VideoModel.create({
              url: `http://${data.Location}`,
              path: data.Key,
              type: mimetype,
              name: originalname,
              water_level: water_level,
              wave_direction: wave_direction,
              embank_ment: embank_ment,
            })
            if (dataValues !== null) {
              return res.send(R.success({
                result,
                ...data
              }, "视频上传服务器成功."))
            } else {
              return res.send(R.fail("视频上传服务器失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("视频上传服务器失败."))
        }
      })
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
 * @apiSampleRequest http://localhost:5050/video/search
 * @apiVersion 1.0.0
 */
router.post("/search", async (req, res) => {
  const {
    water_level,
    wave_direction,
    embank_ment,
    pageNum,
    pageSize
  } = req.body;
  const video = await VideoModel.findAll({
    where: {
      [Op.or]: [{
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
  if (video.length > 0) {
    return res.send(R.success(utils.pageFilter(video, pageNum, pageSize), "查询视频成功."))
  } else {
    return res.send(R.fail("查询视频失败."))
  }
});

/**
 * @api {post} /video/serach 获取观察视频
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
 * @apiSampleRequest http://localhost:5050/video/serach/findOne
 * @apiVersion 1.0.0
 */
router.post("/search/findOne", async (req, res) => {
  try {
    const {
      water_level,
      wave_direction,
      embank_ment,
    } = req.body;
    if (!water_level) {
      return res.send(R.fail("water_level不能为空."))
    }
    if (!wave_direction) {
      return res.send(R.fail("wave_direction不能为空."))
    }
    if (!embank_ment) {
      return res.send(R.fail("embank_ment不能为空."))
    }
    const {
      dataValues
    } = await VideoModel.findOne({
      where: {
        [Op.and]: [{
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
    if (dataValues !== null) {
      return res.send(R.success(dataValues, "获取观看视频成功."))
    } else {
      return res.send(R.fail("获取观看视频失败."))
    }
  } catch (error) {
    return res.send(R.fail("获取观看视频失败."))
  }
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
  const {
    id,
    name
  } = req.query;
  if (!id) {
    return res.send(R.fail("id不可以为空."))
  }
  if (!name) {
    return res.send(R.fail("视频不可以为空."))
  }
  // 删除文件的路径
  const key = uploadUrl + name
  // 腾讯云上传文件
  const params = {
    Bucket: Constants.txCosConfig.Bucket,
    Region: Constants.txCosConfig.Region,
    // 上传文件执行的目录，作为key存在
    Key: key,
  }
  cos.deleteObject({
    ...params
  }, async (err, data) => {
    if (err) {
      return res.send(R.fail("港口视频删除失败."))
    } else {
      const video = await VideoModel.destroy({
        where: {
          id,
        }
      })
      if (video) {
        return res.send(R.success(data, "港口视频删除成功."))
      } else {
        return res.send(R.fail("港口视频删除失败."))
      }
    }
  })

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
router.get("/search/one", async (req, res) => {
  // 通过视频名称查看
  const {
    name
  } = req.query;
  const {
    dataValues
  } = await VideoModel.findOne({
    where: {
      name: name,
    },
  })
  if (dataValues !== null) {
    return res.send(R.success({
      ...dataValues
    }, "查询港区漫游视频成功."))
  } else {
    return res.send(R.fail("查询港区漫游视频失败."))
  }
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
router.post("/findAll", async (req, res) => {
  try {
    const {
      pageNum,
      pageSize
    } = req.body;
    const video = await VideoModel.findAll({
      order: [
        ["create_time"]
      ]
    })
    if (video.length > 0) {
      return res.send(R.success(utils.pageFilter(video, pageNum, pageSize), "获取港区漫游视频成功."))
    } else {
      return res.send(R.fail("获取港区漫游视频失败."))
    }
  } catch (error) {
    return res.send(R.fail("没有视频."))
  }

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
  const {
    water_level,
    wave_direction,
    embank_ment,
    id
  } = req.body;
  /**
   * filename：是文件名的hash，"8e7c4c36a823cd4bd9508167cfc679a6"
   * mimetype 文件类型：'image/png'
   * originalname：原来的名字
   */
  const {
    filename,
    mimetype,
    originalname
  } = req.file
  await fs.rename(filename, originalname, (error) => {
    if (error) {
      return res.send(R.fail("图片重命名失败."))
    } else {
      // 上传文件的路径
      const localFile = dirPath + originalname
      const key = uploadUrl + originalname
      // 腾讯云上传文件
      const params = {
        Bucket: Constants.txCosConfig.Bucket,
        Region: Constants.txCosConfig.Region,
        // 上传文件执行的目录，作为key存在
        Key: key,
        // 上传文件路径
        FilePath: localFile,
        // 表示文件大小超出一个数值时使用分块上传
        SliceSize: 1024 * 1024 * 6,
      }
      cos.sliceUploadFile({
        ...params
      }, async (err, data) => {
        try {
          if (err) {
            return res.send(R.fail("视频修改上传失败."))
          } else {
            // 首先删除上传到本地的文件
            fs.unlinkSync(localFile)
            // 保存图片信息到相关表格中
            const [portpointmap] = await VideoModel.update({
              url: `http://${data.Location}`,
              path: data.Key,
              type: mimetype,
              name: originalname,
              water_level: water_level,
              wave_direction: wave_direction,
              embank_ment: embank_ment,
            }, {
              where: {
                id,
              },
            })
            if (portpointmap) {
              return res.send(R.success({
                ...data
              }, "视频相关信息修改成功."))
            } else {
              return res.send(R.fail("视信息修改失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("视信息修改失败."))
        }
      })
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
router.post("/batch/delete", async (req, res) => {
  const {
    videoIds,
    paths
  } = req.body;
  if (videoIds.length <= 0) {
    return res.send(R.fail("videoIds不可以为空."))
  }
  if (paths.length <= 0) {
    return res.send(R.fail("paths不可以为空."))
  }
  const params = {
    Bucket: Constants.txCosConfig.Bucket,
    Region: Constants.txCosConfig.Region,
    // Prefix表示列出的object的key以prefix开始，非必须
    Prefix: uploadUrl,
  }
  cos.getBucket({
    ...params
  }, (err, data) => {
    if (err) {
      return res.send(R.fail("获取图片列表失败."))
    } else {
      // 需要删除的对象
      const objects = data.Contents.map((item) => {
        // 这里判断输入的paths的值和item.Key是否相等
        const result = paths.map((value) => {
          if (item.Key === value) {
            return {
              Key: value
            }
          }
        })
        return result
      })
      console.log('objects', objects)
      console.log('data', data)
      console.log('paths', paths)
      const paramsData = {
        Bucket: Constants.txCosConfig.Bucket,
        Region: Constants.txCosConfig.Region,
        // 要删除的对象列表
        Objects: objects,
      }
      cos.deleteMultipleObject({
        ...paramsData
      }, async (delError, delData) => {
        if (delError) {
          return res.send(R.fail("港口视频批量删除失败."))
        } else {
          // 删除数据库数据
          const video = await VideoModel.destroy({
            where: {
              id: {
                [Op.in]: videoIds,
              },
            },
          })
          if (video) {
            return res.send(R.success(delData, "港口视频批量删除成功."))
          } else {
            return res.send(R.fail("港口视频批量删除失败."))
          }
        }
      })
    }
  })
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
  const {
    id
  } = req.query;
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