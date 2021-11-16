// 处理excel导入,导出
const express = require('express');

const path = require('path')
const fs = require('fs')

const xlsx = require("node-xlsx");

const multer = require('multer')

const router = express.Router();

// 处理excel文件
const upload = multer({
    dest: "../public/upload"
});

// 定义全局数组
const excelHead = [
    "id",
    "user_name",
    "password",
    "roles",
    "state"
];

// 导入暴露的模型
const UserModel = require('../models/UserModel')

const excelUtils = require('../utils/excelUtils')

/**
 * 1. 点击下载excel模板，生成blob流给前端
 * 2. excel模板输入信息后导入，解析数据(先存到服务器，服务器改名后node-xlsx读取，添加到数据库)存入数据库，存入成功给前端状态，前端重新调用init
 * 3. 前端批量导出，传递过来ids，我们利用ids查询，然后生成数据，blob流返回给前端
 */
/**
 * @api {get} /excel/export excel模板生成
 * @apiDescription excel模板生成
 * @apiName excel模板生成
 * @apiGroup Excel
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "模板生成成功.",
 *      "data":  xlsx.build(excelData, optionArr)
 *  }
 * @apiSampleRequest http://localhost:5050/excel/export
 * @apiVersion 1.0.0
 */
router.get("/export", (req, res) => {
    const excelData = [{
        name: "用户模板.xlsx", // 给第一个sheet指名字
        data: [
            [
                "学号",
                "姓名",
                "密码",
                "角色",
                "状态"
            ],
        ],
    }, ];
    const optionArr = {
        "!cols": [{
                wch: 10
            },
            {
                wch: 10
            },
            {
                wch: 10
            },
            {
                wch: 10
            },
            {
                wch: 10
            }
        ],
    };
    res.send(xlsx.build(excelData, optionArr));
});

// excel导入数据到用户表,
/**
 * @api {post} /excel/upload excel导入数据到用户表
 * @apiDescription excel导入数据到用户表
 * @apiName excel导入数据到用户表
 * @apiGroup Excel
 * @apiBody {File} file excel文件
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "成功导入excel到数据库.",
 *  }
 * @apiSampleRequest http://localhost:5050/excel/upload
 * @apiVersion 1.0.0
 */
router.post('/upload', upload.single('file'), (req, res, next) => {
    try {
        // 重命名文件夹
        fs.rename(
            // 上传文件路径，这里可以修改，后期上线改为服务器的路径
            req.file.path,
            req.file.destination + "/" + "用户模板.xlsx",
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        )
        // 解析模板,返回对象形式的键值对
        const excelObj = xlsx.parse("../public/upload/用户模板.xlsx")
        console.log(`excelObj`, excelObj[0].data)
        const dataArr = excelObj[0].data;
        // 判断是不是使用的指定模板导入的
        if (excelObj[0].data[0].toString() === "学号,姓名,密码,角色,状态") {
            // 删除二位数组第一项，也就是表头数据
            dataArr.shift()
            // 遍历
            dataArr.map((item) => {
                const addData = {}
                excelHead.map((key, index) => {
                    addData[key] = item[index] ? item[index] : ''
                })
                console.log(`addData`, addData)
                // 使用模板插入数据
                UserModel.create(
                    addData
                ).then(user => {
                    if (user) {
                        return res.send({
                            status: 200,
                            msg: '成功导入excel到数据库.'
                        })
                    }
                }).catch(err => {
                    res.send({
                        status: 201,
                        msg: '模板匹配错误，请检查关键字.'
                    })
                    next(err)
                })
            })
        } else {
            // 不是的话,返回给前端错误状态
            return res.send({
                status: 201,
                msg: '模板匹配错误，请检查关键字.'
            })
        }
    } catch (error) {
        console.error('导入异常.', error)
        res.send({
            status: 201,
            msg: '导入异常, 请重新尝试'
        })
    }

})

module.exports = router;