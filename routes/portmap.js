// 港口地图表
const express = require('express')
const fs = require('fs')
const path = require('path')
const {
    Op
} = require("sequelize");

const router = express.Router();

const multer = require('multer')

// 导入暴露的模型
const PortMapModel = require('../models/PortMapModel')

const utils = require('../utils/utils');

// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', '/public/UploadImages/point-map/' + utils.getNowFormatDate())

// 存储在服务器上的,/root/docker/node_serve/ImageUpload/
// const dirPath = path.join('/root/docker/node_serve/ImageUpload/')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdir(dirPath, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    cb(null, dirPath)
                }
            })
        } else {
            cb(null, dirPath)
        }
    },
    filename: function (req, file, cb) {
        console.log('filename()', file)
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage
})

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
router.post('/upload', upload.single('image'), (req, res) => {
    // 判断是否有文件
    const file = req.file
    console.log(`file`, file)
    if (file === null) {
        return res.send({
            status: 400,
            msg: '图片不可以为空.',
        })
    }
    // 获取文件类型是image/png还是其他
    const fileTyppe = file.mimetype
    // 获取图片相关数据，比如文件名称，文件类型
    const extName = path.extname(file.path)
    // 去掉拓展名的一点
    const extNameOut = extName.substr(1)
    // 返回文件的类型
    const type = utils.getType(fileTyppe, extNameOut)
    if (type === null) {
        res.send({
            status: 400,
            msg: '不支持该类型的图片.',
        })
        return
    }
    PortMapModel.create({
        url: `${file.originalname}`,
        path: '/UploadImages/point-map/' + utils.getNowFormatDate() + '/' + file.originalname,
        type: fileTyppe,
        name: `${file.originalname}`,
    }).then(portmap => {
        res.send({
            status: 200,
            msg: '港口地图上传成功.',
            data: portmap
        })
    }).catch(error => {
        console.error('港口地图上传失败.', error)
        res.send({
            status: 400,
            msg: '港口地图上传失败.'
        })
    })
})

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
router.get('/delete', (req, res) => {
    const {
        id
    } = req.query
    PortMapModel.destroy({
        where: {
            id: id
        }
    }).then(portmap => {
        res.send({
            status: 200,
            msg: '港口地图删除成功.',
        })
    }).catch(error => {
        console.error('港口地图删除失败.', error)
        res.send({
            status: 400,
            msg: '港口地图删除失败.'
        })
    })
})

/**
 * @api {get} /portmap/find 查询港口地图
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
router.get('/find', (req, res) => {
    PortMapModel.findAll({}).then(portmap => {
        res.send({
            status: 200,
            msg: '查询港口地图成功.',
            data: portmap
        })
    }).catch(error => {
        console.error('查询港口地图失败.', error)
        res.send({
            status: 400,
            msg: '查询港口地图失败.'
        })
    })
})

module.exports = router;