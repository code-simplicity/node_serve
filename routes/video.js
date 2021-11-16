// 获取视频
const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router();

const multer = require('multer')

const VideoModel = require('../models/VideoModel');
const {
    Op
} = require('sequelize');
const {
    send
} = require('process');

// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', 'public/video')
const publicUrl = path.join(__dirname, '..', 'public')

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

// 上传视频到服务器
router.post('/upload', upload.single('video'), (req, res) => {
    const {
        water_level,
        wave_direction,
        embank_ment
    } = req.body
    const file = req.file
    console.log(`file`, file)
    if (file === null) {
        res.send({
            status: 400,
            msg: '视频不能为空.'
        })
    }
    // 获取文件类型是image/png还是其他
    const fileTyppe = file.mimetype
    VideoModel.create({
        id: `${Date.now()}`,
        url: `${file.originalname}`,
        path: '/video/' + file.originalname,
        type: fileTyppe,
        name: `${file.originalname}`,
        water_level: water_level,
        wave_direction: wave_direction,
        embank_ment: embank_ment
    }).then(video => {
        res.send({
            status: 200,
            msg: '视频上传服务器成功.',
            data: video
        })
    }).catch(error => {
        console.error('视频上传失败.', error)
        res.send({
            status: 400,
            msg: '视视频上传失败.',
        })
    })
})

// 查询视频,通过三个参数查询，水位，波浪来向，外堤布置位置查询
router.post('/serach', (req, res) => {
    // 通过图片名称，水位，波浪来向，堤坝布置查询视频
    const {
        water_level,
        wave_direction,
        embank_ment
    } = req.body
    VideoModel.findOne({
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
    }).then(video => {
        if (video) {
            res.send({
                status: 200,
                msg: '查询视频成功',
                data: video
            })
        }
    }).catch(error => {
        console.error('查询视频失败', error)
        res.send({
            status: 400,
            msg: '查询视频失败，请重试！'
        })
    })
})

// 删除视频,根据id
router.get('/delete', (req, res) => {
    const {
        id
    } = req.query
    VideoModel.destroy({
        where: {
            id
        }
    }).then(video => {
        res.send({
            status: 200,
            msg: '删除视频成功.'
        })
    }).catch(error => {
        console.error('删除视频失败.', error)
        res.send({
            status: 400,
            msg: '删除视频失败,请重试！'
        })
    })
})

module.exports = router;