// 港口点位地图表
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const router = express.Router();

const multer = require("multer");

const utils = require("../utils/utils");

// 导入暴露的模型
const PortPointMapModel = require("../models/PortPointMapModel");

// 存储在服务器上的,/root/docker/Graduation-Project/uploadUrl

// const dirPath = uploadUrl + "/image/port-point-map/" + utils.getNowFormatDate();

const dirPath = path.join(
  __dirname,
  "..",
  "public/uploadUrl/image/port-point-map"
);
const upload = multer({ dest: dirPath });

/**
 * @api {post} /portpointmap/upload 上传图片到服务器，保留数据在数据库
 * @apiDescription 上传图片到服务器
 * @apiName 上传图片到服务器
 * @apiGroup PortPointMap
 * @apiBody {File} image 图片
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/upload
 * @apiVersion 1.0.0
 */
router.post("/upload", upload.single("image"), async (req, res) => {
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
  PortPointMapModel.create({
    url: name,
    path: filePath,
    type: type,
    name: name,
    water_level: water_level,
    wave_direction: wave_direction,
    embank_ment: embank_ment,
  })
    .then((img) => {
      res.send({
        status: 200,
        msg: "图片上传服务器成功.",
        data: img,
      });
    })
    .catch((error) => {
      console.error("图片上传失败.", error);
      res.send({
        status: 400,
        msg: "图片上传失败.",
      });
    });
});

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
router.post("/search", (req, res) => {
  // 通过水位，波浪来向，堤坝布置查询图片
  const { water_level, wave_direction, embank_ment, pageNum, pageSize } =
    req.body;
  PortPointMapModel.findAll({
    where: {
      [Op.and]: [
        {
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
    .then((img) => {
      if (img) {
        res.send({
          status: 200,
          msg: "查询港口点位图成功.",
          data: utils.pageFilter(img, pageNum, pageSize),
        });
      } else {
        res.send({
          status: 400,
          msg: "查询港口点位图失败.",
        });
      }
    })
    .catch((error) => {
      console.error("查询港口点位图失败.", error);
      res.send({
        status: 400,
        msg: "查询港口点位图失败.",
      });
    });
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
    const { pageNum, pageSize } = req.body;
    const result = await PortPointMapModel.findAll({
      order: [["create_time", "DESC"]],
    });
    if (result.length > 0) {
      if (pageNum && pageSize) {
        res.send({
          status: 200,
          msg: "查询成功.",
          data: utils.pageFilter(result, pageNum, pageSize),
        });
      } else {
        res.send({
          status: 200,
          msg: "查询成功.",
          data: result,
        });
      }
    }
  } catch (error) {
    console.error("查询失败.", error);
    res.send({
      status: 400,
      msg: "查询失败.",
    });
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
  const { id } = req.query;
  // 获取路径
  const data = await PortPointMapModel.findOne({
    where: {
      id,
    },
  });
  // 删除存储在磁盘的图片
  fs.unlinkSync(data.path);
  PortPointMapModel.destroy({
    where: {
      id: id,
    },
  })
    .then((img) => {
      if (img) {
        res.send({
          status: 200,
          msg: "删除图片成功.",
        });
      } else {
        res.send({
          status: 200,
          msg: "图片不存在或者已经删除.",
        });
      }
    })
    .catch((error) => {
      console.error("删除图片失败.", error);
      res.send({
        status: 400,
        msg: "删除图片失败.",
      });
    });
});

router.post("/update", upload.single("image"), async (req, res) => {
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

/**
 * @api {post} /portpointmap/update 修改图片信息
 * @apiDescription 修改图片信息
 * @apiName 修改图片信息
 * @apiGroup PortPointMap
 * @apiBody {String} id 图片id
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片修改成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/update
 * @apiVersion 1.0.0
 */
// 分片合并
router.post("/update/merge_chunks", async (req, res) => {
  const {
    size,
    name,
    total,
    hash,
    type,
    water_level,
    wave_direction,
    embank_ment,
    id,
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
  // 先获取到原来的，再删除
  const data = await PortMapModel.findOne({
    where: {
      id,
    },
  });
  fs.unlinkSync(data.path);
  // 再修改相关信息
  await PortPointMapModel.update(
    {
      url: name,
      path: filePath,
      type: type,
      name: name,
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
    .then((img) => {
      if (img) {
        res.send({
          status: 200,
          msg: "港修改港口点位图信息成功.",
        });
      }
    })
    .catch((error) => {
      console.error("修改图片信息失败.", error);
      res.send({
        status: 200,
        msg: "修改图片信息失败.",
      });
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
  const { portpointmapIds } = req.body;
  if (!portpointmapIds) {
    return res.send({
      status: 400,
      msg: "portpointmapIds不可以为空",
    });
  }
  await PortPointMapModel.destroy({
    where: {
      id: {
        [Op.in]: portpointmapIds,
      },
    },
  })
    .then((img) => {
      if (img) {
        res.send({
          status: 200,
          msg: "港口点位图批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "港口点位图批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("港口点位图批量删除失败.", err);
      res.send({
        status: 400,
        msg: "港口点位图批量删除失败.",
      });
    });
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
router.get("/search", (req, res) => {
  // 查询图片
  // 首先查询存储的位置，
  // 通过文件流的形式将图片读写
  const { id } = req.query;
  PortPointMapModel.findOne({
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
      console.error("查询港口点位图失败.", error);
      res.send({
        status: 400,
        msg: "查询港口点位图失败.",
      });
    });
});

module.exports = router;
