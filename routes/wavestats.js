// 波形统计图标
const express = require('express')
const fs = require('fs')
const path = require('path')
const {
    Op
} = require("sequelize");

const router = express.Router();

const multer = require('multer')

// 导入暴露的模型
const WaveStatsModel = require('../models/WaveStatsModel')


const utils = require('../utils/utils');

// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', '/public/UploadImages/wave-stats/' + utils.getNowFormatDate())

// 配置规则 配置目录/日期/原名称.类型
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
router.post('/upload', upload.single('image'), (req, res) => {
    const {
        point_id
    } = req.body
    if (!point_id) {
        return res.send({
            status: 400,
            msg: '请选择对应的点位id.',
        })
    }
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
    WaveStatsModel.create({
        point_id: point_id,
        url: file.originalname,
        path: '/UploadImages/wave-stats/' + utils.getNowFormatDate() + '/' + file.originalname,
        type: fileTyppe,
        name: file.originalname,
    }).then(result => {
        res.send({
            status: 200,
            msg: '图片上传服务器成功.',
            data: result
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
router.get('/delete', (req, res) => {
    const {
        id
    } = req.query
    WaveStatsModel.destroy({
        where: {
            id: id
        }
    }).then(result => {
        res.send({
            status: 200,
            msg: '删除波形统计图成功.',
        })
    }).catch(error => {
        console.error('删除波形统计图失败.', error)
        res.send({
            status: 400,
            msg: '删除波形统计图失败.'
        })
    })
})

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
router.post('/update', (req, res) => {
    const wavestats = req.body
    WaveStatsModel.update(wavestats, {
        where: {
            id: wavestats.id
        }
    }).then(result => {
        res.send({
            status: 200,
            msg: '修改波形统计图成功.',
        })
    }).catch(error => {
        console.error('修改波形统计图失败.', error)
        res.send({
            status: 400,
            msg: '修改波形统计图失败.'
        })
    })
})

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
router.get('/search/point_id', (req, res) => {
    const {
        point_id
    } = req.query
    WaveStatsModel.findOne({
        where: {
            point_id: point_id
        }
    }).then(result => {
        res.send({
            status: 200,
            msg: '查询波形统计图成功.',
            data: result
        })
    }).catch(error => {
        console.error('查询波形统计图失败.', error)
        res.send({
            status: 400,
            msg: '查询波形统计图失败.'
        })
    })
})

/**
 * @api {get} /wavestats/search/all  查询波形统计图
 * @apiDescription 查询波形统计图
 * @apiName 查询波形统计图
 * @apiGroup WaveStats
 * @apiBody {String} point_id 点位图id（外键）
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "图片上传服务器成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/wavestats/search/all
 * @apiVersion 1.0.0
 */
router.get('/search/all', async (req, res) => {
    const {
        pageNum,
        pageSize
    } = req.query
    await WaveStatsModel.findAll({
        order: [
            ['create_time', 'DESC']
        ],
    }).then(result => {
        res.send({
            status: 200,
            msg: '查询波形统计图成功.',
            data: utils.pageFilter(result, pageNum, pageSize),
        })
    }).catch(error => {
        console.error('查询波形统计图失败.', error)
        res.send({
            status: 400,
            msg: '查询波形统计图失败.'
        })
    })
})

module.exports = router;