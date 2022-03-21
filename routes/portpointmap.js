// 港口点位地图表
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  Op
} = require("sequelize");

const router = express.Router();

const multer = require("multer");

const utils = require("../utils/utils");

// 导入暴露的模型
const PortPointMapModel = require("../models/PortPointMapModel");

// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');

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
const uploadUrl = "node-serve/port-point-map/"

/**
 * 港口点位图上传.
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  const {
    filename,
    mimetype,
    originalname
  } = req.file
  const {
    water_level,
    wave_direction,
    embank_ment,
  } = req.body

  await fs.rename(filename, originalname, (error) => {
    if (error) {
      return res.send(R.fail({
        error
      }, "图片重命名失败."))
    } else {
      const localFile = dirPath + originalname
      const key = uploadUrl + originalname
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
        if (err) {
          return res.send(R.fail({
            err
          }, "港口点位图上传失败."))
        } else {
          fs.unlinkSync(localFile)
          const {
            dataValues
          } = await PortPointMapModel.create({
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
              value: {
                ...dataValues,
              },
              data: {
                ...data
              }
            }, "港口点位图上传成功."))
          } else {
            return res.send(R.fail("港口点位地图上传失败."))
          }
        }
      })
    }
  })
})

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
router.post("/search", async (req, res) => {
  // 通过水位，波浪来向，堤坝布置查询图片
  const {
    water_level,
    wave_direction,
    embank_ment,
    pageNum,
    pageSize
  } =
  req.body;
  const portpointmap = await PortPointMapModel.findAll({
    where: {
      [Op.or]: [{
          water_level: water_level ? water_level : "",
        },
        {
          wave_direction: wave_direction ? wave_direction : "",
        },
        {
          embank_ment: embank_ment ? embank_ment : "",
        },
      ],
    },
  })
  if (portpointmap.length > 0) {
    return res.send(R.success(utils.pageFilter(portpointmap, pageNum, pageSize), "查询港口点位图成功."))
  } else {
    return res.send(R.fail("查询港口点位图失败."))
  }
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
router.post("/findAll", async (req, res) => {
  try {
    const {
      pageNum,
      pageSize
    } = req.body;
    const result = await PortPointMapModel.findAll({
      order: [
        ["create_time"]
      ],
    });
    if (result.length > 0) {
      return res.send(R.success(utils.pageFilter(result, pageNum, pageSize), "港口点位图全部显示成功."))
    } else {
      return res.send(R.fail("不存在港口点位图."))
    }
  } catch (error) {
    return res.send(R.fail("不存在港口点位图."))
  }
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
  cos.deleteObject({
    ...params
  }, async (err, data) => {
    if (err) {
      return res.send(R.fail("港口点位图删除失败."))
    } else {
      const portpointmap = await PortPointMapModel.destroy({
        where: {
          id,
        }
      })
      if (portpointmap) {
        return res.send(R.success(data, "港口点位图删除成功."))
      } else {
        return res.send(R.fail("港口点位图删除失败."))
      }
    }
  })
});

/**
 * 更新港口点位图
 */
router.post("/update", upload.single("image"), async (req, res) => {
  const {
    id,
    water_level,
    wave_direction,
    embank_ment
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
            return res.send(R.fail("港口点位地图上传失败."))
          } else {
            // 首先删除上传到本地的文件
            fs.unlinkSync(localFile)
            // 保存图片信息到相关表格中
            const [portpointmap] = await PortPointMapModel.update({
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
              }, "港口点位图修改成功."))
            } else {
              return res.send(R.fail("港口点位图修改失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("港口点位图修改失败."))
        }
      })
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
router.post("/batch/delete", async (req, res) => {

  // paths为存储的key，这个和cos存储的Key进行对比
  const {
    portpointmapIds,
    paths
  } = req.body;
  if (portpointmapIds.length <= 0) {
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
          return res.send(R.fail("港口点位图批量删除失败."))
        } else {
          // 删除数据库数据
          const portmap = await PortPointMapModel.destroy({
            where: {
              id: {
                [Op.in]: portpointmapIds,
              },
            },
          })
          if (portmap) {
            return res.send(R.success(delData, "批量删除港口点位图成功."))
          } else {
            return res.send(R.fail("港口点位图批量删除失败."))
          }
        }
      })
    }
  })
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
    } = await PortPointMapModel.findOne({
      where: {
        id,
      },
    })
    if (dataValues !== null) {
      return res.send(R.success({
        ...dataValues
      }, "查询港口点位图成功."))
    } else {
      return res.send(R.fail("查询港口点位图成功."))
    }
  } catch (error) {
    return res.send(R.fail("查询港口点位图失败."))
  }
});

module.exports = router;