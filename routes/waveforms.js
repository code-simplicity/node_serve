// 波形图
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  Op
} = require("sequelize");

// 导入暴露的模型
const WaveFormsModel = require("../models/WaveFormsModel");

// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');

const router = express.Router();

const multer = require("multer");

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
const uploadUrl = "node-serve/wave-forms/"

/**
 * @api {post} /waveforms/upload  上传波形图
 * @apiDescription 上传波形图
 * @apiName 上传波形图
 * @apiGroup WaveForms
 * @apiBody {File} image 图片
 * @apiBody {String} point_id 点位id，外键
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/upload
 * @apiVersion 1.0.0
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  const {
    point_id
  } = req.body;
  if (!point_id) {
    return res.send(R.fail("请选择对应的点位id."))
  }
  const {
    filename,
    mimetype,
    originalname
  } = req.file
  await fs.rename(filename, originalname, (error) => {
    if (error) {
      return res.send(R.fail("波形图重命名失败."))
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
        SliceSize: 1024 * 1024 * 5,
      }
      cos.sliceUploadFile({
        ...params
      }, async (err, data) => {
        try {
          if (err) {
            return res.send(R.fail("波形图上传失败."))
          } else {
            // 首先删除上传到本地的文件
            fs.unlinkSync(localFile)
            const {
              dataValues
            } = await WaveFormsModel.create({
              point_id: point_id,
              url: `http://${data.Location}`,
              path: data.Key,
              type: mimetype,
              name: originalname,
            })
            if (dataValues !== null) {
              return res.send(R.success({
                ...data
              }, "波形图上传成功."))
            } else {
              return res.send(R.fail("波形图上传失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("波形图上传失败."))
        }
      })
    }
  })
});

/**
 * @api {get} /waveforms/delete  删除波形图
 * @apiDescription 删除波形图
 * @apiName 删除波形图
 * @apiGroup WaveForms
 * @apiParam {String} id 波形图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/delete
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
    return res.send(R.fail("波形图名称不可以为空."))
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
      return res.send(R.fail("波形图删除失败."))
    } else {
      const waveforms = await WaveFormsModel.destroy({
        where: {
          id,
        }
      })
      if (waveforms) {
        return res.send(R.success(data, "波形图删除成功."))
      } else {
        return res.send(R.fail("波形图删除失败."))
      }
    }
  })
});

/**
 * @api {post} /waveforms/update  修改波形图
 * @apiDescription 修改波形图
 * @apiName 修改波形图
 * @apiGroup WaveForms
 * @apiBody {String} id 波形图id
 * @apiBody {String} point_id 点位图id（外键）
 * @apiBody {String} name 图片名称
 * @apiBody {String} state 状态
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "修改波形图成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/update
 * @apiVersion 1.0.0
 */
router.post("/update", upload.single("image"), async (req, res) => {
  const {
    point_id,
    id
  } = req.body;
  const {
    filename,
    mimetype,
    originalname
  } = req.file
  if (!point_id) {
    return res.send(R.fail("请选择对应的点位id."))
  }
  if (!id) {
    return res.send(R.fail("波形图id不可以为空."))
  }
  // 图片重命名
  await fs.rename(filename, originalname, (error) => {
    if (error) {
      return res.send(R.fail("波形图重命名失败."))
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
            const [portpointmap] = await WaveFormsModel.update({
              point_id: point_id,
              url: `http://${data.Location}`,
              path: data.Key,
              type: mimetype,
              name: originalname
            }, {
              where: {
                id,
              },
            })
            if (portpointmap) {
              return res.send(R.success({
                ...data
              }, "修改波形图成功."))
            } else {
              return res.send(R.fail("修改波形图失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("修改波形图失败."))
        }
      })
    }
  });
});

/**
 * @api {get} /waveforms/search/point_id  根据点位图id查询波形图
 * @apiDescription 根据点位图id查询波形图
 * @apiName 根据点位图id查询波形图
 * @apiGroup WaveForms
 * @apiBody {String} point_id 点位图id（外键）
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/search/point_id
 * @apiVersion 1.0.0
 */
router.get("/search/point_id", async (req, res) => {
  try {
    const {
      point_id
    } = req.query;
    const {
      dataValues
    } = await WaveFormsModel.findOne({
      where: {
        point_id: point_id,
      },
    })
    if (dataValues !== null) {
      return res.send(R.success({
        ...dataValues
      }, "查询波形图成功."))
    } else {
      return res.send(R.fail("查询波形图失败."))
    }
  } catch (error) {
    return res.send(R.fail("查询波形图失败."))
  }
});

/**
 * @api {post} /waveforms/findAll  查询波形图
 * @apiDescription 查询波形图
 * @apiName 查询波形图
 * @apiGroup WaveForms
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 页面数量
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "获取波形图成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/findAll
 * @apiVersion 1.0.0
 */
router.post("/findAll", async (req, res) => {
  const {
    pageNum,
    pageSize
  } = req.body;
  const waveforms = await WaveFormsModel.findAll({
    order: [
      ["create_time"]
    ],
  })
  if (waveforms.length > 0) {
    return res.send(R.success(utils.pageFilter(waveforms, pageNum, pageSize), "获取波形图成功."))
  } else {
    return res.send(R.fail("获取波形图失败."))
  }
});

/**
 * @api {post} /waveforms/batch/delete 波形图批量删除
 * @apiDescription 波形图批量删除
 * @apiName 波形图批量删除
 * @apiGroup WaveForms
 * @apiBody {Array} waveformsIds 波形图ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "波形图批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/batch/delete
 * @apiVersion 1.0.0
 */
router.post("/batch/delete", async (req, res) => {
  const {
    waveformsIds,
    paths
  } = req.body;
  if (!waveformsIds) {
    return res.send(R.fail("waveformsIds不可以为空."))
  }
  if (!paths) {
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
          return res.send(R.fail("波形图批量删除失败."))
        } else {
          // 删除数据库数据
          const waveforms = await WaveFormsModel.destroy({
            where: {
              id: {
                [Op.in]: waveformsIds,
              },
            },
          })
          if (waveforms) {
            return res.send(R.success(delData, "波形图批量删除成功."))
          } else {
            return res.send(R.fail("波形图批量删除失败."))
          }
        }
      })
    }
  })
});

/**
 * @api {get} /waveforms/search 显示图片
 * @apiDescription 显示图片
 * @apiName 显示图片
 * @apiGroup WaveForms
 * @apiParam {String} id 图片id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/waveforms/search
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
    } = await WaveFormsModel.findOne({
      where: {
        id,
      },
    })
    if (dataValues !== null) {
      return res.send(R.success({
        ...dataValues
      }, "查询波形图成功."))
    } else {
      return res.send(R.fail("查询波形图失败."))
    }
  } catch (error) {
    return res.send(R.fail("查询波形图失败."))
  }
});

/**
 * 获取点位图下的对应点位表的所有波形图
 *  http://localhost:5050/waveforms/pointIds/findAll
 * 
 */
router.post("/pointIds/findAll", async (req, res) => {
  try {
    const {
      pointIds,
      pageNum,
      pageSize
    } = req.body
    if (pointIds.length <= 0) {
      return res.send(R.fail("pointIds不可以为空"))
    }
    const waveforms = await WaveFormsModel.findAll({
      where: {
        point_id: {
          [Op.or]: pointIds
        }
      }
    })
    if (waveforms.length > 0) {
      return res.send(R.success(utils.pageFilter(waveforms, pageNum, pageSize), "查询点位图下所有波形图成功."))
    } else {
      return res.send(R.fail("查询点位图下所有波形图失败."))
    }
  } catch (error) {
    return res.send(R.fail("查询点位图下所有波形图失败."))
  }
})

module.exports = router;