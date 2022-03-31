const userServer = require("../../server/admin/userServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const redis = require("../../config/redis")

const userController = {

    /**
     * 登录
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     */
    async login(args, req, res) {
        try {
            let {
                id,
                password,
                captcha,
                from
            } = args
            // 判断用户从哪个平台进入的
            if (utils.isEmpty(from) || Constants.App.FROM_PC !== from) {
                from = Constants.App.FROM_PC
            }
            if (utils.isEmpty(id)) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
            }
            if (utils.isEmpty(password)) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不可以为空"))
            }
            if (password.length !== 32) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请使用MD5摘要加密"))
            }
            // 从cookie中获取captchakey
            const captchaKey = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
            // 通过key从redis中获取相应的值
            const captchaValue = await redis.getString(Constants.User.CAPTCHA_CONTENT + captchaKey)
            if (captcha !== captchaValue) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("图灵验证码不正确"))
            }
            // 验证成功之后删除redis中的验证码
            redis.delString(Constants.User.CAPTCHA_CONTENT + captchaKey)
            // 查询用户是否有
            const {
                dataValues
            } = await userServer.login(id)
            if (dataValues === null) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("用户名或者密码不正确"))
            }
            // 对比密码输入是否一致，首先对密码进行解密
            const desPassword = utils.desDecrypt(dataValues.password, Constants.User.PASSWORD_MESSAGE)
            if (password !== desPassword) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不正确"))
            }
            // 判断用户是否是管理员
            if (dataValues.roles !== "admin") {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("没有权限登录"))
            }
            // 这回创建token
            const tokenKey = await utils.createToken(req, dataValues, from)
            utils.setCookieKey(res, Constants.User.USER_COOKIE_DATA, tokenKey, Constants.TimeSecound.DAY)
            utils.delCookieKey(res, Constants.User.LAST_CAPTCHA_ID)
            // 将这个tokenKey和id返回给前端，之后前端将这个tokenKey保存，然后通过设置在headers.authorization来验证码接口
            const tokenKeyValue = `Bearer,${tokenKey}`
            const {
                user_name,
                sex,
                score,
                email,
                roles
            } = dataValues
            return res.send(new SuccessModel({
                tokenKey: tokenKeyValue,
                id,
                user_name,
                sex,
                score,
                email,
                roles
            }, "管理员登录成功"))
        } catch (error) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("登录失败，请检查重试"))
        }
    },

    /**
     * 获取用户信息
     * @param {*} args 
     * @param {*} res 
     */
    async getUserInfo(args, res) {
        const {
            id
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        const {
            dataValues
        } = await userServer.getUserInfo(id)
        const {
            password,
            ...data
        } = dataValues
        if (dataValues !== null) {
            return res.send(new SuccessModel(data, "获取用户信息成功"))
        } else {
            return res.send(new FailModel("获取用户信息失败"))
        }
    }
}

module.exports = userController