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


// 文件上传到服务器的路径,存储在本地的
const dirPath = path.join(__dirname, '..', 'public/video')
// const publicUrl = path.join(__dirname, '..', 'public')

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

/**
 * @api {post} /video/upload 上传视频到服务器
 * @apiDescription 上传视频到服务器
 * @apiName 上传视频到服务器
 * @apiGroup Video
 * @apiBody {File} video 视频
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "视频上传服务器成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/upload
 * @apiVersion 1.0.0
 */
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
    // 获取文件类型是video/mp4还是其他
    const fileTyppe = file.mimetype
    VideoModel.create({
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

/**
 * @api {post} /video/serach 查询视频
 * @apiDescription 查询视频
 * @apiName 查询视频
 * @apiGroup Video
 * @apiBody {String} water_level 水位
 * @apiBody {String} wave_direction 波浪方向
 * @apiBody {String} embank_ment 堤坝布置位置
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询视频成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/serach
 * @apiVersion 1.0.0
 */
router.post('/serach', (req, res) => {
    const {
        water_level,
        wave_direction,
        embank_ment
    } = req.query
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

/**
 * @api {get} /video/delete 删除上传的视频
 * @apiDescription 删除上传的视频
 * @apiName 删除上传的视频
 * @apiGroup Video
 * @apiParam {String} id 水位
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "删除视频成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/video/delete
 * @apiVersion 1.0.0
 */
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

/**
 * @api {get} /video/search/one 获取港区漫游的视频
 * @apiDescription 获取港区漫游的视频
 * @apiName 获取港区漫游的视频
 * @apiGroup Video
 * @apiParam {String} name 港区漫游的视频名称
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询港区漫游视频成功.",
 *      "data": video
 *  }
 * @apiSampleRequest http://localhost:5050/video/search/one
 * @apiVersion 1.0.0
 */
router.get('/search/one', (req, res) => {
    // 通过视频名称查看
    const {
        name,
    } = req.query
    VideoModel.findOne({
        where: {
            name: name
        }
    }).then(video => {
        res.send({
            status: 200,
            msg: '查询港区漫游视频成功.',
            data: video
        })
    }).catch(error => {
        console.error('查询港区漫游视频失败.', error)
        res.send({
            status: 400,
            msg: '查询港区漫游视频失败.'
        })
    })
})

module.exports = router;