// 点位表
const express = require('express')
const fs = require('fs')
const path = require('path')
const {
    Op
} = require("sequelize");

const router = express.Router();

// 导入暴露的模型
const PointModel = require('../models/PointModel')

/**
 * @api {post} /point/add 添加点位表内容
 * @apiDescription 添加点位表内容
 * @apiName 添加点位表内容
 * @apiGroup Point
 * @apiBody {String} port_point_map_id 港口点位图id
 * @apiBody {String} content 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/add
 * @apiVersion 1.0.0
 */
router.post('/add', (req, res) => {
    const {
        port_point_map_id,
        content
    } = req.body
    PointModel.create({
        content: content,
        port_point_map_id: port_point_map_id
    }).then(point => {
        res.send({
            status: 200,
            msg: '添加点位成功.',
            data: point
        })
    }).catch(error => {
        console.error('添加点位失败.', error)
        res.send({
            status: 400,
            msg: '添加点位失败，请重试！'
        })
    })
})

/**
 * @api {post} /point/delete 删除点位表
 * @apiDescription 删除点位表
 * @apiName 删除点位表
 * @apiGroup Point
 * @apiParam {String} id 点位图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/delete
 * @apiVersion 1.0.0
 */
router.get('/delete', (req, res) => {
    const {
        id
    } = req.query
    PointModel.destroy({
        where: {
            id: id
        }
    }).then(point => {
        res.send({
            status: 200,
            msg: '删除点位成功.',
        })
    }).catch(error => {
        console.error('删除点位失败.', error)
        res.send({
            status: 400,
            msg: '删除点位失败，请重试！'
        })
    })
})

/**
 * @api {post} /point/update 修改点位表
 * @apiDescription 修改点位表
 * @apiName 修改点位表
 * @apiGroup Point
 * @apiBody {String} id 点位图id
 * @apiBody {String} port_point_map_id 港口点位图id
 * @apiBody {String} content 点位图内容
 * @apiBody {String} state 状态
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/update
 * @apiVersion 1.0.0
 */
router.post('/update', (req, res) => {
    const point = req.body
    PointModel.update(point, {
        where: {
            id: point.id
        }
    }).then(point => {
        res.send({
            status: 200,
            msg: '修改点位成功.',
        })
    }).catch(error => {
        console.error('修改点位失败.', error)
        res.send({
            status: 400,
            msg: '修改点位失败，请重试！'
        })
    })
})

/**
 * @api {get} /point/search 查询port_point_map_id下的点位图
 * @apiDescription 查询port_point_map_id下的点位图
 * @apiName 查询port_point_map_id下的点位图
 * @apiGroup Point
 * @apiParam {String} port_point_map_id 港口点位图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/search
 * @apiVersion 1.0.0
 */
router.get('/search', (req, res) => {
    const {
        port_point_map_id
    } = req.query
    PointModel.findAll({
        where: {
            port_point_map_id: port_point_map_id
        },
        order: [
            ['create_time']
        ]
    }).then(point => {
        res.send({
            status: 200,
            msg: '查询点位成功.',
            data: point
        })
    }).catch(error => {
        console.error('查询点位失败.', error)
        res.send({
            status: 400,
            msg: '查询点位失败，请重试！'
        })
    })
})

module.exports = router;