// 港口地图表
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  Op
} = require("sequelize");

// 引入七牛云
const qiniu = require("qiniu")

const router = express.Router();

const multer = require("multer");

// 导入暴露的模型
const PortMapModel = require("../models/PortMapModel");

const utils = require("../utils/utils");

// 引入常量
const Constants = require("../utils/Constants")

const mac = new qiniu.auth.digest.Mac(Constants.QI_NIU_CONFIG.accessKey, Constants.QI_NIU_CONFIG.secretKey)

// 存储在服务器上的,/root/docker/Graduation-Project/uploadUrl
const dirPath = path.join(__dirname, "..", "public/uploadUrl/image/port-map");
const upload = multer({
  dest: dirPath
});

/**
 * @api {post} /portmap/upload 上传港口地图
 * @apiDescription 上传港口地图
 * @apiName 上传港口地图
 * @apiGroup PortMap
 * @apiBody {File} image 图片
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "港口地图上传成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/upload
 * @apiVersion 1.0.0
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  console.log("file upload :>> ");
  const {
    name,
    total,
    index,
    size,
    hash
  } = req.body;
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
    type
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
  PortMapModel.create({
      url: name,
      path: filePath,
      type: type,
      name: name,
    })
    .then((portmap) => {
      res.send({
        status: 200,
        msg: "港口地图上传成功.",
        data: portmap,
      });
    })
    .catch((error) => {
      console.error("港口地图上传失败.", error);
      res.send({
        status: 400,
        msg: "港口地图上传失败.",
      });
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
    id
  } = req.query;
  // 获取路径
  const data = await PortMapModel.findOne({
    where: {
      id,
    },
  });
  // 删除存储在磁盘的图片
  fs.unlinkSync(data.path);
  // 删除数据库字段，
  PortMapModel.destroy({
      where: {
        id: id,
      },
    })
    .then((portmap) => {
      res.send({
        status: 200,
        msg: "港口地图删除成功.",
      });
    })
    .catch((error) => {
      console.error("港口地图删除失败.", error);
      res.send({
        status: 400,
        msg: "港口地图删除失败.",
      });
    });
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
router.post("/find", (req, res) => {
  const {
    pageNum,
    pageSize
  } = req.body;
  PortMapModel.findAll({
      order: [
        ["create_time", "DESC"]
      ],
    })
    .then((portmap) => {
      res.send({
        status: 200,
        msg: "查询港口地图成功.",
        data: utils.pageFilter(portmap, pageNum, pageSize),
      });
    })
    .catch((error) => {
      console.error("查询港口地图失败.", error);
      res.send({
        status: 400,
        msg: "查询港口地图失败.",
      });
    });
});

router.post("/update", upload.single("image"), async (req, res) => {
  const {
    name,
    total,
    index,
    size,
    hash
  } = req.body;
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
 * @api {post} /portmap/update 修改港口地图
 * @apiDescription 修改港口地图
 * @apiName 修改港口地图
 * @apiGroup PortMap
 * @apiBody {String} id 港口地图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "港口地图修改成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/portmap/update
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
    id
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
  PortMapModel.update({
      url: name,
      path: filePath,
      type: type,
      name: name,
    }, {
      where: {
        id,
      },
    })
    .then((portmap) => {
      if (portmap) {
        res.send({
          status: 200,
          msg: "港口地图修改成功.",
        });
      }
    })
    .catch((error) => {
      console.error("港口地图修改失败.", error);
      res.send({
        status: 200,
        msg: "港口地图修改失败.",
      });
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
  const {
    portmapIds
  } = req.body;
  if (!portmapIds) {
    return res.send({
      status: 400,
      msg: "portmapIds不可以为空",
    });
  }
  await PortMapModel.destroy({
      where: {
        id: {
          [Op.in]: portmapIds,
        },
      },
    })
    .then((portmap) => {
      if (portmap) {
        res.send({
          status: 200,
          msg: "港口地图批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "港口地图批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("港口地图批量删除失败.", err);
      res.send({
        status: 400,
        msg: "港口地图批量删除失败.",
      });
    });
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
router.get("/search", (req, res) => {
  try {
    // 查询图片
    // 首先查询存储的位置，
    // 通过文件流的形式将图片读写
    const {
      id
    } = req.query;
    PortMapModel.findOne({
      where: {
        id,
      },
    }).then((img) => {
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
    });
  } catch (error) {
    console.error("查询港口点位图失败.", error);
    res.send({
      status: 400,
      msg: "查询港口点位图失败.",
    });
  }
});

module.exports = router;