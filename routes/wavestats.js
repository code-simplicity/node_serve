// 波形统计图标
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const router = express.Router();

const multer = require("multer");

// 导入暴露的模型
const WaveStatsModel = require("../models/WaveStatsModel");

const utils = require("../utils/utils");
const { uploadUrl } = require("../config/config");

// 文件上传到服务器的路径,存储在本地的

// 存储在服务器上的,/root/docker/Graduation-Project/uploadUrl
// const dirPath = uploadUrl + "/image/wave-forms/" + utils.getNowFormatDate();
const dirPath = path.join(
  __dirname,
  "..",
  "public/uploadUrl/image/wave-stats/" + utils.getNowFormatDate()
);

// 配置规则 配置目录/日期/原名称.类型
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, { recursive: true }, function (err) {
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
 * @api {post} /wavestats/upload  上传波形统计图
 * @apiDescription 上传波形统计图
 * @apiName 上传波形统计图
 * @apiGroup WaveStats
 * @apiBody {File} image 图片
 * @apiBody {String} point_id 点位id，外键
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/upload
 * @apiVersion 1.0.0
 */
router.post("/upload", upload.single("image"), (req, res) => {
  const { point_id } = req.body;
  if (!point_id) {
    return res.send({
      status: 400,
      msg: "请选择对应的点位id.",
    });
  }
  // 判断是否有文件
  const file = req.file;
  console.log(`file`, file);
  if (file === null) {
    return res.send({
      status: 400,
      msg: "图片不可以为空.",
    });
  }
  // 获取文件类型是image/png还是其他
  const fileTyppe = file.mimetype;
  // 获取图片相关数据，比如文件名称，文件类型
  const extName = path.extname(file.path);
  // 去掉拓展名的一点
  const extNameOut = extName.substr(1);
  // 返回文件的类型
  const type = utils.getType(fileTyppe, extNameOut);
  if (type === null) {
    res.send({
      status: 400,
      msg: "不支持该类型的图片.",
    });
    return;
  }
  // 先读取这个文件
  fs.readFile(file.path, "base64", function (err, data) {
    if (err) {
      return;
    } else {
      fs.writeFile(file.path, data, "base64", function (err) {
        if (err) {
          return;
        } else {
          console.log("图片写入成功");
        }
      });
    }
  });
  try {
    WaveStatsModel.create({
      point_id: point_id,
      url: file.originalname,
      path: file.path,
      type: fileTyppe,
      name: file.originalname,
    })
      .then((result) => {
        res.send({
          status: 200,
          msg: "图片上传服务器成功.",
          data: result,
        });
      })
      .catch((error) => {
        console.error("图片上传失败.", error);
        res.send({
          status: 400,
          msg: "图片上传失败.",
        });
      });
  } catch (error) {
    console.error(err);
  }
});

/**
 * @api {get} /wavestats/delete  删除波形统计图
 * @apiDescription 删除波形统计图
 * @apiName 删除波形统计图
 * @apiGroup WaveStats
 * @apiParam {String} id 波形统计图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/delete
 * @apiVersion 1.0.0
 */
router.get("/delete", (req, res) => {
  const { id } = req.query;
  WaveStatsModel.destroy({
    where: {
      id: id,
    },
  })
    .then((result) => {
      res.send({
        status: 200,
        msg: "删除波形统计图成功.",
      });
    })
    .catch((error) => {
      console.error("删除波形统计图失败.", error);
      res.send({
        status: 400,
        msg: "删除波形统计图失败.",
      });
    });
});

/**
 * @api {post} /wavestats/update  修改波形统计图
 * @apiDescription 修改波形统计图
 * @apiName 修改波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} id 波形统计图id
 * @apiBody {String} point_id 点位图id（外键）
 * @apiBody {String} name 图片名称
 * @apiBody {String} state 状态
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/update
 * @apiVersion 1.0.0
 */
router.post("/update", upload.single("image"), (req, res) => {
  const { point_id, id } = req.body;
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
  // 获取文件类型是image/png还是其他
  const fileTyppe = file.mimetype;
  // 获取图片相关数据，比如文件名称，文件类型
  const extName = path.extname(file.path);
  // 去掉拓展名的一点
  const extNameOut = extName.substr(1);
  // 返回文件的类型
  const type = utils.getType(fileTyppe, extNameOut);
  if (type === null) {
    res.send({
      status: 400,
      msg: "不支持该类型的图片.",
    });
    return;
  }
  WaveStatsModel.update(
    {
      point_id: point_id,
      url: file.originalname,
      path:
        "/UploadImages/wave-forms/" +
        utils.getNowFormatDate() +
        "/" +
        file.originalname,
      type: fileTyppe,
      name: file.originalname,
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((result) => {
      res.send({
        status: 200,
        msg: "修改波形统计图成功.",
      });
    })
    .catch((error) => {
      console.error("修改波形统计图失败.", error);
      res.send({
        status: 400,
        msg: "修改波形统计图失败.",
      });
    });
});

/**
 * @api {get} /wavestats/search/point_id  根据点位图id查询波形统计图
 * @apiDescription 根据点位图id查询波形统计图
 * @apiName 根据点位图id查询波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} point_id 点位图id（外键）
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/search/point_id
 * @apiVersion 1.0.0
 */
router.get("/search/point_id", (req, res) => {
  const { point_id } = req.query;
  WaveStatsModel.findOne({
    where: {
      point_id: point_id,
    },
  })
    .then((result) => {
      res.send({
        status: 200,
        msg: "查询波形统计图成功.",
        data: result,
      });
    })
    .catch((error) => {
      console.error("查询波形统计图失败.", error);
      res.send({
        status: 400,
        msg: "查询波形统计图失败.",
      });
    });
});

/**
 * @api {get} /wavestats/findAll 获取所有波形统计图
 * @apiDescription 获取所有波形统计图
 * @apiName 获取所有波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 数量
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "获取波形统计图成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/findAll
 * @apiVersion 1.0.0
 */
router.post("/findAll", async (req, res) => {
  const { pageNum, pageSize } = req.body;
  await WaveStatsModel.findAll({
    order: [["create_time", "DESC"]],
  })
    .then((result) => {
      if (result) {
        res.send({
          status: 200,
          msg: "获取波形统计图成功.",
          data: utils.pageFilter(result, pageNum, pageSize),
        });
      } else {
        res.send({
          status: 400,
          msg: "获取波形统计图失败.",
        });
      }
    })
    .catch((error) => {
      console.error("获取波形统计图失败.", error);
      res.send({
        status: 400,
        msg: "获取波形统计图失败.",
      });
    });
});

/**
 * @api {post} /batch/delete 波形统计图批量删除
 * @apiDescription 波形统计图批量删除
 * @apiName 波形统计图批量删除
 * @apiGroup WaveStats
 * @apiBody {Array} wavestatsIds 波形统计图ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "波形统计图批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/batch/delete
 * @apiVersion 1.0.0
 */
router.post("/batch/delete", async (req, res) => {
  const { wavestatsIds } = req.body;
  if (!wavestatsIds) {
    return res.send({
      status: 400,
      msg: "wavestatsIds不可以为空",
    });
  }
  await WaveStatsModel.destroy({
    where: {
      id: {
        [Op.in]: wavestatsIds,
      },
    },
  })
    .then((result) => {
      if (result) {
        res.send({
          status: 200,
          msg: "波形统计图批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "波形统计图批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("波形统计图批量删除失败.", err);
      res.send({
        status: 400,
        msg: "波形统计图批量删除失败.",
      });
    });
});

/**
 * @api {get} /wavestats/search 显示图片
 * @apiDescription 显示图片
 * @apiName 显示图片
 * @apiGroup WaveStats
 * @apiParam {String} id 图片id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/search
 * @apiVersion 1.0.0
 */
router.get("/search", (req, res) => {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  const { id } = req.query;
  WaveStatsModel.findOne({
    where: {
      id,
    },
  })
    .then((img) => {
      if (img) {
        // 设置响应头，告诉浏览器这是图片
        res.writeHead(200, { "Content-Type": "image/png" });
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
      console.error("查询波形统计图失败.", error);
      res.send({
        status: 400,
        msg: "查询波形统计图失败.",
      });
    });
});

module.exports = router;
