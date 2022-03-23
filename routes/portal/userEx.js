/**
 * 发送邮箱的接口
 */

const express = require("express");
const router = express.Router();

const {
    Op
} = require("sequelize");

const UserModel = require("../../models/UserModel");

const EmailSendUtils = require("../../utils/EmailSendUtils")

const Constants = require("../../utils/Constants")

const R = require("../../utils/R")

const utils = require("../../utils/utils")

/**
 * 发送邮箱验证码
 * emaillAddress：邮箱地址
 * mustRegister：是否已经检查邮箱是否注册
 */
router.post("/sendMailCode", async (req, res) => {
    const {
        emaillAddress,
        mustRegister
    } = req.body
    // 首先检查邮箱地址是否为空
    if (utils.isEmpty(emaillAddress)) {
        return res.send(R.fail("邮箱地址不可以为空."))
    }
    // 对邮箱进行验证
    const regEx = /^([a-z0-9A-Z]+[-|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-zA-Z]{2,}$/
    const mailAddress = regEx.test(emaillAddress)
    // 检查邮箱格式是否正确
    if (!mailAddress) {
        return res.send(R.fail("邮箱格式不正确."))
    }
    // 查看邮箱是否被注册
    const user = await UserModel.findOne({
        where: {
            email: emaillAddress
        }
    })
    // 存在邮箱
    if (user !== null && !mustRegister) {
        return res.send(R.fail("该邮箱已经被注册."))
    }
    if (user === null && mustRegister) {
        return res.send(R.fail("该邮箱未被注册."))
    }
    // 首先获取验证码
    // 同一个ip不能超过10次验证码
    const remoteAddr = req.ip
    console.log('remoteAddr', remoteAddr)
    // 组合ip地址和公共字段
    const ipKey = Constants.User.EMAIL_IP + remoteAddr
    console.log("ipKey", ipKey)
    // 判断同一ip是否有超过10次的请求

})