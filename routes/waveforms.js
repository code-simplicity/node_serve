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
const uploadUrl = `node-serve/wave-forms/${utils.getNowFormatDate()}`

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
  // 判断是否有文件
  const file = req.file;
  console.log(`file`, file);
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
    id
  } = req.query;
  // 获取路径
  const data = await WaveFormsModel.findOne({
    where: {
      id,
    },
  });
  // 删除存储在磁盘的图片
  fs.unlinkSync(data.path);
  WaveFormsModel.destroy({
      where: {
        id: id,
      },
    })
    .then((result) => {
      res.send({
        status: 200,
        msg: "删除波形图成功.",
      });
    })
    .catch((error) => {
      console.error("删除波形图失败.", error);
      res.send({
        status: 400,
        msg: "删除波形图失败.",
      });
    });
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
  const file = req.file;
  if (!point_id) {
    return res.send({
      status: 400,
      msg: "请选择对应的点位id.",
    });
  }
  // 判断是否有文件
  if (file === null) {
    return res.send({
      status: 400,
      msg: "图片不可以为空.",
    });
  }
  // 获取路径
  const data = await WaveFormsModel.findOne({
    where: {
      id,
    },
  });
  // 删除存储在磁盘的图片
  fs.unlinkSync(data.path);
  fs.unlinkSync(data.path);
  await WaveFormsModel.update({
      point_id: point_id,
      url: file.originalname,
      path: file.path,
      type: file.mimetype,
      name: file.originalname,
    }, {
      where: {
        id: id,
      },
    })
    .then((result) => {
      if (result) {
        res.send({
          status: 200,
          msg: "修改波形图成功.",
        });
      }
    })
    .catch((error) => {
      console.error("修改波形图失败.", error);
      res.send({
        status: 400,
        msg: "修改波形图失败.",
      });
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
router.get("/search/point_id", (req, res) => {
  const {
    point_id
  } = req.query;
  WaveFormsModel.findOne({
      where: {
        point_id: point_id,
      },
    })
    .then((result) => {
      res.send({
        status: 200,
        msg: "查询波形图成功.",
        data: result,
      });
    })
    .catch((error) => {
      console.error("查询波形图失败.", error);
      res.send({
        status: 400,
        msg: "查询波形图失败.",
      });
    });
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
  await WaveFormsModel.findAll({
      order: [
        ["create_time", "DESC"]
      ],
    })
    .then((result) => {
      res.send({
        status: 200,
        msg: "获取波形图成功.",
        data: utils.pageFilter(result, pageNum, pageSize),
      });
    })
    .catch((error) => {
      console.error("获取波形图失败.", error);
      res.send({
        status: 400,
        msg: "获取波形图失败.",
      });
    });
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
    waveformsIds
  } = req.body;
  if (!waveformsIds) {
    return res.send({
      status: 400,
      msg: "waveformsIds不可以为空",
    });
  }
  // 获取路径
  const data = await WaveFormsModel.findAll({
    where: {
      id: {
        [Op.in]: waveformsIds,
      },
    },
  });
  // 批量删除存储在磁盘的图片
  data.forEach((item) => {
    fs.unlinkSync(item.path);
  });
  await WaveFormsModel.destroy({
      where: {
        id: {
          [Op.in]: waveformsIds,
        },
      },
    })
    .then((result) => {
      if (result) {
        res.send({
          status: 200,
          msg: "波形图批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "波形图批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("波形图批量删除失败.", err);
      res.send({
        status: 400,
        msg: "波形图批量删除失败.",
      });
    });
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
router.get("/search", (req, res) => {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  const {
    id
  } = req.query;
  WaveFormsModel.findOne({
      where: {
        id,
      },
    })
    .then((img) => {
      if (img) {
        // 设置响应头，告诉浏览器这是图片
        res.writeHead(200, {
          "Content-Type": "image/png"
        });
        // 创建一个读取图片流
        const stream = fs.createReadStream(img.path);
        // 声明一个存储数组
        const resData = [];
        if (stream) {
          stream.on("data", (chunk) => {
            resData.push(chunk);
          });
          stream.on("end", () => {
            // 把流存储到缓存池
            const finalData = Buffer.concat(resData);
            // 响应，写数据
            res.write(finalData);
            res.end();
          });
        }
      }
    })
    .catch((error) => {
      console.error("查询波形图失败.", error);
      res.send({
        status: 400,
        msg: "查询波形图失败.",
      });
    });
});

module.exports = router;