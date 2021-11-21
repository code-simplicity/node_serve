// 文字内容
const express = require('express');
const router = express.Router();
const {
    Op
} = require("sequelize");

const path = require('path')
const fs = require('fs')

// 导入暴露的模型
const ContentModel = require('../models/ContentModel')

// 添加内容
router.post('/add', (req, res) => {
    const {
        content
    } = req.body
    ContentModel.create({
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
    ContentModel.destroy({
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
    ContentModel.update({
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
    ContentModel.findOne({
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

module.exports = router