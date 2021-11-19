// 选择列表
const express = require('express');
const router = express.Router();
const {
    Op
} = require("sequelize");

const path = require('path')
const fs = require('fs')

// 导入暴露的模型
const ChooseModel = require('../models/ChooseModel')

// 添加选择数据
router.post('/add', (req, res) => {
    const {
        content,
        category
    } = req.body
    ChooseModel.create({
        category: category,
        content: content
    }).then(content => {
        res.send({
            status: 200,
            msg: '添加内容成功.',
            data: content
        })
    }).catch(error => {
        console.error('添加内容失败.', error)
        res.send({
            status: 400,
            msg: '添加内容失败，请重试！'
        })
    })
})

// 删除
router.post('/delete', (req, res) => {
    const {
        id
    } = req.body
    ChooseModel.destroy({
        where: {
            id
        }
    }).then(content => {
        res.send({
            status: 200,
            msg: '删除内容成功.',
            data: content
        })
    }).catch(error => {
        console.error('删除内容失败.', error)
        res.send({
            status: 400,
            msg: '删除内容失败，请重试！'
        })
    })
})

// 修改
router.post('/update', (req, res) => {
    const {
        id,
        content
    } = req.body
    ChooseModel.update({
        content
    }, {
        where: {
            id
        }
    }).then(content => {
        res.send({
            status: 200,
            msg: '修改内容成功.',
            data: content
        })
    }).catch(error => {
        console.error('修改内容失败.', error)
        res.send({
            status: 400,
            msg: '修改内容失败，请重试！'
        })
    })
})

// 查询
router.get('/search', (req, res) => {
    const {
        id
    } = req.query
    ChooseModel.findOne({
        where: {
            id
        }
    }).then(content => {
        res.send({
            status: 200,
            msg: '查询内容成功.',
            data: content
        })
    }).catch(error => {
        console.error('查询内容失败.', error)
        res.send({
            status: 400,
            msg: '查询内容失败，请重试！'
        })
    })
})

// 根据分类获取分类内容
router.get('/findlist', (req, res) => {
    // const {
    //     category
    // } = req.query
    ChooseModel.findAll({
        // where: {
        //     category
        // },
        order: [
            ['create_time']
        ]
        // 将按最大年龄进行升序排序
    }).then(content => {
        res.send({
            status: 200,
            msg: '查询内容成功.',
            data: content
        })
    }).catch(error => {
        console.error('查询内容失败.', error)
        res.send({
            status: 400,
            msg: '查询内容失败，请重试！'
        })
    })
})

module.exports = router