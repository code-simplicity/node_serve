// 波形图标
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
const WaveFormsModel = require('../models/WaveFormsModel')

// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', '/public/UploadImages/waveforms/')

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
 * @api {post} /image/upload 上传图片到服务器，保留数据在数据库
 * @apiDescription 上传图片到服务器
 * @apiName 上传图片到服务器
 * @apiGroup Image
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
 * @apiSampleRequest http://localhost:5050/waveforms/upload
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
    const type = Utils.getType(fileTyppe, extNameOut)
    if (type === null) {
        res.send({
            status: 400,
            msg: '不支持该类型的图片.',
        })
        return
    }
    WaveFormsModel.create({
        url: `${file.originalname}`,
        path: '/UploadImages/' + getNowFormatDate() + '/' + file.originalname,
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

module.exports = router;