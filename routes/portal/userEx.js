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

const redis = require("../../config/redis")

/**
 * 发送邮箱验证码
 * emailAddress：邮箱地址
 * mustRegister：是否已经检查邮箱是否注册
 * http://localhost:5050/portal/userEx/sendMailCode
 */
router.post("/userEx/sendMailCode", async (req, res) => {
    const {
        emailAddress,
        mustRegister
    } = req.body
    // 首先检查邮箱地址是否为空
    if (utils.isEmpty(emailAddress)) {
        return res.send(R.fail("邮箱地址不可以为空."))
    }
    // 对邮箱进行验证
    const regEx = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    const mailAddress = regEx.test(emailAddress)
    // 检查邮箱格式是否正确
    if (!mailAddress) {
        return res.send(R.fail("邮箱格式不正确."))
    }
    // 查看邮箱是否被注册
    const user = await UserModel.findOne({
        where: {
            email: emailAddress
        }
    })
    // 存在邮箱
    if (user !== null && !mustRegister) {
        return res.send(R.fail("该邮箱已经被注册."))
    }
    // 首先获取验证码
    let remoteAddr = req.ip
    // 字符串替代
    remoteAddr = remoteAddr.replaceAll(":", "-")
    console.log('remoteAddr', remoteAddr)
    // 组合ip地址和公共字段
    const ipKey = Constants.User.EMAIL_IP + remoteAddr
    console.log("ipKey", ipKey)
    // 判断同一ip是否有超过20次的请求
    // 防止被频繁调用，这里通过ip地址进行拦截
    const ipTime = await redis.getString(ipKey)
    console.log("ipTime", ipTime)
    if (!utils.isEmpty(ipTime)) {
        let i = parseInt(ipTime)
        console.log(`当前ip${remoteAddr}调用了${i}次`)
        if (i > 20) {
            return res.send(R.fail("请不要频繁发送验证码，否则将被拉黑."))
        } else {
            i++
            redis.setString(ipKey, i, Constants.TimeSecound.TWO_HOUR)
        }
    } else {
        // 两小时有效
        redis.setString(ipKey, "1", Constants.TimeSecound.TWO_HOUR)
    }
    /**
     * 邮箱拦截，不予许调用20次以上
     */
    const addressKey = Constants.User.EMAIL_ADDRESS + remoteAddr
    // 判断是否多次请求，超过10次就返回频繁请求的结果
    const addressTime = await redis.getString(addressKey)
    if (!utils.isEmpty(addressTime)) {
        let i = parseInt(addressTime)
        console.log(`当前邮箱${emailAddress}调用了${i}次`)
        if (i > 20) {
            return res.send(R.fail("请不要频繁发送邮箱验证码，否则将被拉黑."))
        } else {
            i++
            redis.setString(addressKey, i, Constants.TimeSecound.TWO_HOUR)
        }
    } else {
        redis.setString(addressKey, "1", Constants.TimeSecound.TWO_HOUR)
    }
    /**
     * 产生6位数字的随机验证码
     */
    const emailCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
    console.log("emailCode", emailCode)
    // 保存验证码到redis，5分钟过期
    redis.setString(Constants.User.EMAIL_CODE + emailAddress, emailCode, Constants.TimeSecound.FIVE_MIN)
    // 发送验证码
    const data = await EmailSendUtils.sendEmail(emailAddress, emailCode)
    if (data) {
        return res.send(R.success({
            data
        }, "发送验证码成功."))
    } else {
        return res.send(R.fail("发送验证码失败."))
    }
})

module.exports = router