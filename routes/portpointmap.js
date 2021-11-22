// 港口点位地图表
const express = require('express')
const fs = require('fs')
const path = require('path')
const {
    Op
} = require("sequelize");

const router = express.Router();

const multer = require('multer')


const Utils = require('../utils/utils');

// 导入暴露的模型
const PortPointMapModel = require('../models/PortPointMapModel')

// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', '/public/UploadImages/port-point-map/' + Utils.getNowFormatDate())

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
router.post('/upload', upload.single('image'), (req, res) => {
    const {
        water_level,
        wave_direction,
        embank_ment
    } = req.body
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
    const type = Utils.getType(fileTyppe, extNameOut)
    if (type === null) {
        res.send({
            status: 400,
            msg: '不支持该类型的图片.',
        })
        return
    }
    PortPointMapModel.create({
        url: `${file.originalname}`,
        path: '/UploadImages/port-point-map/' + Utils.getNowFormatDate() + '/' + file.originalname,
        type: fileTyppe,
        name: `${file.originalname}`,
        water_level: water_level,
        wave_direction: wave_direction,
        embank_ment: embank_ment
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

/**
 * @api {post} /portpointmap/search 搜索图片
 * @apiDescription 搜索图片
 * @apiName 搜索图片
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
 * @apiSampleRequest http://localhost:5050/portpointmap/search
 * @apiVersion 1.0.0
 */
router.post('/search', (req, res) => {
    // 通过水位，波浪来向，堤坝布置查询图片
    const {
        water_level,
        wave_direction,
        embank_ment
    } = req.body
    PortPointMapModel.findOne({
        where: {
            [Op.and]: [{
                    water_level: water_level
                },
                {
                    wave_direction: wave_direction
                },
                {
                    embank_ment: embank_ment
                }
            ]
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
router.post('/findAll', async (req, res) => {
    try {
        const {
            limit,
            offset
        } = req.body
        const result = await PortPointMapModel.findAll({
            // order: [
            //     ['create_time', 'DESC']
            // ],
            limit: limit,
            // offset: offset
        })
        console.log(`result`, result)
        if (result.length > 0) {
            res.send({
                status: 200,
                msg: '查询成功.',
                data: result,
            })
        }
    } catch (error) {
        console.error('查询失败.', error)
        res.send({
            status: 400,
            msg: '查询失败.'
        })
    }
})

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
router.get('/delete', (req, res) => {
    const {
        id
    } = req.query
    PortPointMapModel.destroy({
        where: {
            id: id
        }
    }).then(img => {
        if (img) {
            res.send({
                status: 200,
                msg: '删除图片成功.',
            })
        } else {
            res.send({
                status: 200,
                msg: '图片不存在或者已经删除.',
            })
        }
    }).catch(error => {
        console.error('删除图片失败.', error)
        res.send({
            status: 400,
            msg: '删除图片失败.'
        })
    })
})

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
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/portpointmap/update
 * @apiVersion 1.0.0
 */
router.post('/update', (req, res) => {
    const portpointmap = req.body
    PortPointMapModel.update(
        portpointmap, {
            where: {
                id: portpointmap.id
            }
        }).then(img => {
        if (img) {
            res.send({
                status: 200,
                msg: '修改图片信息成功.',
                data: img
            })
        }
    }).catch(error => {
        console.error('修改图片信息失败.', error)
        res.send({
            status: 400,
            msg: '修改图片信息失败.'
        })
    })
})

module.exports = router;