// 处理图像的上传
const express = require('express')
const fs = require('fs')
const path = require('path')
const {
    Op
} = require("sequelize");

const router = express.Router();

const multer = require('multer')

// 导入暴露的模型
const ImageModel = require('../models/ImageModel')

// 引入常量
const Constants = require('../utils/Constants')

const Utils = require('../utils/utils');

// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', 'public/ImagesUpload')
const publicUrl = path.join(__dirname, '..', 'public')

// 存储在服务器上的,/root/docker/node_serve/ImageUpload/
// const dirPath = path.join('/root/docker/node_serve/ImageUpload/')


// 创建图片保存的路径,绝对路径
// 配置规则 配置目录/类型/原名称.类型
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdir(dirPath, (err) => {
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
        // const ext = path.extname(file.originalname)
        // 返回原来的名称
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage
})

// const uploadFile = upload.single('image')

/**
 * @api {post} /image/upload 上传图片到服务器，保留数据在数据库
 * @apiDescription 上传图片到服务器
 * @apiName 上传图片到服务器
 * @apiGroup Image
 * @apiBody {File} image 图片
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/image/upload
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
    const type = getType(fileTyppe, extNameOut)
    if (type === null) {
        res.send({
            status: 400,
            msg: '不支持该类型的图片.',
        })
        return
    }
    ImageModel.create({
        id: `${Date.now()}`,
        url: `${file.originalname}`,
        // path: 'http://localhost:5050/ImagesUpload/' + file.originalname,
        path: '/ImagesUpload/' + file.originalname,
        type: fileTyppe,
        name: `${file.originalname}`,
    }).then(img => {
        res.send({
            status: 200,
            msg: '图片上传服务器成功.',
            data: img
        })
    }).catch(error => {
        console.error('图片上传失败.', error)
        res.send({
            status: 400,
            msg: '图片上传失败.'
        })
    })

})

// 判断图片类型是否是平时我们所支持的
function getType(contentType, name) {
    let type = null
    if (Constants.TYPE_PNG_WITH_PREFIX === contentType && name === Constants.TYPE_PNG) {
        type = Constants.TYPE_PNG
    } else if (Constants.TYPE_JPG_WITH_PREFIX === contentType && name === Constants.TYPE_JPG) {
        type = Constants.TYPE_JPG
    } else if (Constants.TYPE_GIF_WITH_PREFIX === contentType && name === Constants.TYPE_GIF) {
        type = Constants.TYPE_GIF
    }
    return type
}

// 图片请求，通过请求参数(水位高低，波浪来向，外堤布置三个参数获取到图片)
/**
 * @api {get} /image/find 搜索图片
 * @apiDescription 搜索图片
 * @apiName 搜索图片
 * @apiGroup Image
 * @apiParam {String} name 名字
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/image/find
 * @apiVersion 1.0.0
 */
router.get('/find', (req, res) => {
    // 通过图片名查询
    const {
        name
    } = req.query
    ImageModel.findAll({
        where: {
            name: {
                [Op.like]: `%${name}%`
            }
        }
    }).then(img => {
        res.send({
            status: 200,
            msg: '查询图片成功.',
            data: img
        })
    }).catch(error => {
        console.error('查询图片失败.', error)
        res.send({
            status: 400,
            msg: '查询图片失败.'
        })
    })
})

/**
 * @api {get} /image/find/image 去掉数据库的查找
 * @apiDescription 去掉数据库的查找
 * @apiName 去掉数据库的查找
 * @apiGroup Image
 * @apiParam {String} folder 文件夹
 * @apiParam {String} subfolder 子文件夹
 * @apiParam {String} fn 图片名
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询图片成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/image/find/image
 * @apiVersion 1.0.0
 */
router.get('/find/image', (req, res) => {
    try {
        const {
            folder,
            subfolder
        } = req.query
        let fn = req.query.fn + '.png'
        let path = `pic/${folder}/${subfolder}/${fn}`
        if (folder !== null || subfolder !== null || fn !== null) {
            res.send({
                status: 200,
                msg: '获取图片成功',
                // data: 'http://localhost:5050/ImagesUpload/' + path,
                data: '/ImagesUpload/' + path,
            });
        }
    } catch (error) {
        console.error('参数不完整.')
        res.send({
            status: 400,
            msg: '参数不完整.',
        });
    }

})

module.exports = router;