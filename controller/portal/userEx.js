/**
 * 发送邮箱验证码
 */
const EmailSendUtils = require("../../utils/EmailSendUtils")
const Constants = require("../../utils/Constants")
const R = require("../../utils/R")
const utils = require("../../utils/utils")
const redis = require("../../config/redis")
const model = require("../../server/portal/user")
const resCode = require("../../utils/resCode")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const userEx = {
    async sendEmail(args, req, res) {
        try {
            const {
                emailAddress
            } = args
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
            const emailInfo = await model.checkEmail(emailAddress)
            // 邮箱已经存在
            if (emailInfo !== null) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("邮箱已存在"))
            }
            // 首先获取验证码
            let remoteAddr = req.ip
            // 字符串替代
            remoteAddr = remoteAddr.replaceAll(":", "-")
            // 组合ip地址和公共字段
            const ipKey = Constants.User.EMAIL_IP + remoteAddr
            // 判断同一ip是否有超过20次的请求
            // 防止被频繁调用，这里通过ip地址进行拦截
            const ipTime = await redis.getString(ipKey)
            if (!utils.isEmpty(ipTime)) {
                let i = parseInt(ipTime)
                console.log(`当前ip${remoteAddr}调用了${i}次`)
                if (i > 20) {
                    return res.send(new FailModel("请不要频繁发送验证码，否则将被拉黑"))
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
                    return res.send(new FailModel("请不要频繁发送邮箱验证码，否则将被拉黑"))
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
            // 保存验证码到redis，5分钟过期
            redis.setString(Constants.User.EMAIL_CODE + emailAddress, emailCode, Constants.TimeSecound.FIVE_MIN)
            // 发送验证码
            const data = await EmailSendUtils.sendEmail(emailAddress, emailCode)
            if (data) {
                return res.send(new SuccessModel("发送验证码成功"))
            } else {
                return res.send(new FailModel("发送验证码失败"))
            }
        } catch (error) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("邮箱已存在"))
        }
    }
}

module.exports = userEx