const express = require("express");
const router = express.Router();

const {
    Op
} = require("sequelize");

const R = require("../../utils/R")

const utils = require("../../utils/utils")

const redis = require("../../config/redis")

const EmailSendUtils = require("../../utils/EmailSendUtils.js")

/**
 * 测试发送邮件
 */
router.post("/sendMail", async (req, res) => {
    const {
        code,
        emailAddress
    } = req.body
    const data = await EmailSendUtils.sendEmail(emailAddress, code)
    const remoteAddr = req.ip
    const ipKey = "email_key_" + remoteAddr
    // 防止被频繁调用，这里通过ip地址进行拦截
    const ipTime = redis.getString(ipKey)
    if (!utils.isEmpty(ipTime)) {
        let i = parseInt(ipTime)
        console.log(`当前ip${remoteAddr}调用了${i}次`)
        if (i > 10) {
            return res.send(R.fail("请不要频繁发送验证码，否则将被拉黑."))
        } else {
            i++
            redis.setString(ipKey, i, )
        }
    }
    const redisResult = await redis.setString(ipKey, code, 60 * 1)
    if (data) {
        return res.send(R.success({
            data,
            redisResult
        }, "发送验证码成功."))
    } else {
        return res.send(R.fail({
            redisResult
        }, "发送验证码失败."))
    }
})

module.exports = router;