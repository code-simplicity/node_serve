// 港口地图表
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  Op
} = require("sequelize");

// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');

const router = express.Router();

const multer = require("multer");

// 导入暴露的模型
const PortMapModel = require("../models/PortMapModel");

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
const uploadUrl = "node-serve/port-map/"

/**
 * 上传港口地图
 */
router.post("/upload", upload.single("image"), async (req, res) => {
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
  // 图片重命名
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
        SliceSize: 1024 * 1024 * 3,
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
            return res.send(R.fail("图片上传失败."))
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
            } = await PortMapModel.create({
              url: `http://${data.Location}`,
              path: data.Key,
              type: mimetype,
              name: originalname,
            })
            if (dataValues !== null) {
              return res.send(R.success({
                result,
                ...data
              }, "图片上传成功."))
            } else {
              return res.send(R.fail("图片上传失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("图片上传失败."))
        }
      })
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
router.get("/delete", async (req, res) => {
  const {
    id,
    name
  } = req.query;
  if (!id) {
    return res.send(R.fail("id不可以为空."))
  }
  if (!name) {
    return res.send(R.fail("图片名称不可以为空."))
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
  // 删除存储在cos中的图片
  cos.deleteObject({
    ...params,
  }, async (err, data) => {
    if (err) {
      return res.send(R.fail("图片删除失败."))
    } else {
      const portmap = await PortMapModel.destroy({
        where: {
          id,
        }
      });
      if (portmap) {
        return res.send(R.success(data, "港口地图删除成功."))
      } else {
        return res.send(R.fail("港口地图删除失败."))
      }
    }
  })
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
router.post("/find", async (req, res) => {
  const {
    pageNum,
    pageSize
  } = req.body;
  const portmap = await PortMapModel.findAll({
    order: [
      ["create_time", "DESC"]
    ],
  })
  if (portmap.length > 0) {
    return res.send(R.success(utils.pageFilter(portmap, pageNum, pageSize), "查询港口地图成功."))
  } else {
    return res.send(R.fail("查询港口地图失败."))
  }
});

/**
 * 修改港口地图
 */
router.post("/update", upload.single("image"), async (req, res) => {
  const {
    id,
  } = req.body
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
  // 图片重命名
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
        SliceSize: 1024 * 1024 * 3,
      }
      cos.sliceUploadFile({
        ...params
      }, async (err, data) => {
        try {
          if (err) {
            return res.send(R.fail("图片上传失败."))
          } else {
            // 首先删除上传到本地的文件
            fs.unlinkSync(localFile)
            // 保存图片信息到相关表格中
            const [portmap] = await PortMapModel.update({
              url: `http://${data.Location}`,
              path: data.Key,
              type: mimetype,
              name: originalname,
            }, {
              where: {
                id,
              },
            })
            if (portmap) {
              return res.send(R.success({
                ...data
              }, "港口地图修改成功."))
            } else {
              return res.send(R.fail("港口地图修改失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("港口地图修改失败."))
        }
      })
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
router.post("/batch/delete", async (req, res) => {
  // paths为存储的key，这个和cos存储的Key进行对比
  const {
    portmapIds,
    paths
  } = req.body;
  if (portmapIds.length <= 0) {
    return res.send(R.fail("portmapIds不可以为空."))
  }
  if (paths.length <= 0) {
    return res.send(R.fail("paths不可以为空."))
  }
  /**
   * 首先先查看指定目录之下的所有文件，然后遍历文件之后进行，通过图片名字进行删除
   * 其次就是在通过portmapIds对数据库数据进行删除
   */
  // 腾讯云上传文件
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
          console.log("delError", delError)
          return res.send(R.fail("批量删除港口地图失败."))
        } else {
          // 删除数据库数据
          const portmap = await PortMapModel.destroy({
            where: {
              id: {
                [Op.in]: portmapIds,
              },
            },
          })
          if (portmap) {
            return res.send(R.success(delData, "批量删除港口地图成功."))
          } else {
            return res.send(R.fail("港口地图批量删除失败."))
          }
        }
      })
    }
  })
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
router.get("/search", async (req, res) => {
  try {
    // 使用对象存储返回url地址
    const {
      id
    } = req.query;
    if (!id) {
      return res.send(R.fail("id不可以为空."))
    }
    const {
      dataValues
    } = await PortMapModel.findOne({
      where: {
        id,
      },
    })
    if (dataValues !== null) {
      return res.send(R.success({
        ...dataValues
      }, "查询港口地图成功."))
    } else {
      return res.send(R.fail("查询港口地图失败."))
    }
  } catch (error) {
    return res.send(R.fail("查询港口地图失败."))
  }
});

module.exports = router;