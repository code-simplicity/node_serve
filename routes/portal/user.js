const express = require("express");

const router = express.Router();
const {
    Op
} = require("sequelize");

const CryptoJS = require("crypto-js")

// 导入暴露的模型
const UserModel = require("../../models/UserModel");

const RefreshTokenModel = require("../../models/RefreshTokenModel");

const jwtUtils = require("../../utils/jwtUtils");

const Constants = require("../../utils/Constants")

const utils = require("../../utils/utils");

const R = require("../../utils/R")

const redis = require("../../config/redis")


/**
 * @api {post} /portal/user/add 用户注册接口
 * @apiDescription 用户注册接口
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} user_name="杜培义" 姓名
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} sex="男" 性别
 * @apiBody  {String} email="" 邮箱
 * @apiBody  {String} emailCode="" 邮箱验证码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/add
 * @apiVersion 1.0.0
 */
router.post("/user/add", async (req, res) => {
    // 用户名，密码，学号，性别，邮箱地址，图灵验证码
    let {
        id,
        user_name,
        password,
        sex,
        email,
        emailCode,
        captcha
    } = req.body
    if (utils.isEmpty(id)) {
        return res.send(R.fail("注册学号不可以为空."))
    }
    // 判断学号是否被注册
    const userId = await UserModel.findOne({
        where: {
            id: id,
        },
    })
    if (userId !== null) {
        return res.send(R.fail("该学号已经被注册，请联系管理员老师."))
    }
    if (utils.isEmpty(user_name)) {
        return res.send(R.fail("姓名不可以为空."))
    }
    if (utils.isEmpty(password)) {
        return res.send(R.fail("密码不可以为空."))
    }
    if (utils.isEmpty(sex)) {
        return res.send(R.fail("性别不可以为空."))
    }
    if (utils.isEmpty(email)) {
        return res.send(R.fail("邮箱不可以为空."))
    }
    if (utils.isEmpty(captcha)) {
        return res.send(R.fail("图灵验证码不可以为空."))
    }
    // 查看邮箱是否被注册
    const userEmail = await UserModel.findOne({
        where: {
            email: email
        }
    })
    // 存在邮箱
    if (userEmail !== null) {
        return res.send(R.fail("该邮箱已经被注册."))
    }
    // 检验邮箱验证码
    const emailCodeRecord = await redis.getString(Constants.User.EMAIL_CODE + email)
    if (utils.isEmpty(emailCodeRecord)) {
        return res.send(R.fail("验证码已经过期，请重试！"))
    }
    if (emailCodeRecord !== emailCode) {
        return res.send(R.fail("邮箱验证码不正确."))
    } else {
        // 刚掉redis中的内容
        redis.delString(Constants.User.EMAIL_CODE + email)
    }
    // 图灵验证码
    // 从cookie中获取captcha的key
    const captchaKey = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
    // 通过key从redis中读取相关的机器验证码的值
    const captchaValue = await redis.getString(Constants.User.CAPTCHA_CONTENT + captchaKey)
    if (utils.isEmpty(captchaValue)) {
        return res.send(R.fail("图灵验证码已过期."))
    }
    if (captcha !== captchaValue) {
        return res.send(R.fail("图灵验证码不正确."))
    } else {
        // 验证成功之后，删除redis的验证码
        redis.delString(Constants.User.CAPTCHA_CONTENT + captchaKey)
    }
    // 判断密码是否通过crypto进行摘要计算，32位
    if (password.length !== 32) {
        return res.send(R.fail("请使用Crypto进行加密"))
    }
    // 对密码进行加密入库
    password = utils.desEncrypt(password, Constants.User.PASSWORD_MESSAGE)
    // 保存信息，入库
    await UserModel.create({
        id,
        user_name,
        password,
        sex,
        email,
    })
    // 返回结果
    return res.send(R.success({}, "添加用户成功."))
});

/**
 * @api {post} /portal/user/login 用户登录接口
 * @apiDescription 用户登录接口
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} email="" 邮箱
 * @apiBody  {String} emailCode="" 邮箱验证码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/login
 * @apiVersion 1.0.0
 */
router.post("/user/login", async (req, res) => {
    // 登录可以使用学号+密码或者邮箱+密码
    const loginVo = req.body
    // 机械验证码
    const {
        captcha
    } = req.body
    // 从cookie中获取captcha的key
    const captchaKey = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
    // 通过key从redis中读取相关的机器验证码的值
    const captchaValue = await redis.getString(Constants.User.CAPTCHA_CONTENT + captchaKey)
    if (captcha !== captchaValue) {
        return res.send(R.fail("图灵验证码不正确."))
    }
    // 验证成功之后，删除redis的验证码
    redis.delString(Constants.User.CAPTCHA_CONTENT + captchaKey)
    // 使用学号或者邮箱进行登录
    if (utils.isEmpty(loginVo.id)) {
        return res.send(R.fail("账户不可以为空"))
    }
    if (utils.isEmpty(loginVo.password)) {
        return res.send(R.fail("密码不可以为空."))
    }
    const user = await UserModel.findOne({
        where: {
            id: loginVo.id
        }
    })
    if (user === null) {
        user = await UserModel.findOne({
            where: {
                email: loginVo.email
            }
        })
    }
    if (user === null) {
        return res.send(R.fail("用户名或者密码不正确."))
    }
    // 用户存在
    // 对比密码是否一致
    // 解密
    const desPassword = utils.desDecrypt(user.dataValues.password, Constants.User.PASSWORD_MESSAGE)
    if (loginVo.password !== desPassword) {
        return res.send(R.fail("密码不正确."))
    }
    // 判断用户是否存在
    if ("1" !== user.dataValues.state) {
        return res.send(R.fail("该用户不存在或者已经被拉黑."))
    }
    console.log("user", user)
    // 创建token，删除cookie
    createToken(req.cookies, res, user.dataValues)
    return res.send(R.success({}, "登录成功."))
})

/**
 * 创建token
 * @param {*} request 请求
 * @param {*} res 响应
 * @param {*} user 用户信息
 */
async function createToken(request, res, user) {
    const oldTokenKey = utils.getCookieKey(request, Constants.User.USER_COOKIE_DATA)
    console.log("oldTokenKey", oldTokenKey)
    // 不能干掉
    const oldRefreshToken = await RefreshTokenModel.findOne({
        where: {
            user_id: user.id
        }
    })
    console.log("oldRefreshToken", oldRefreshToken)

    if (oldRefreshToken !== null) {
        redis.delString(Constants.User.TOKEN_KEY + oldRefreshToken.dataValues.token_key)
    }
    //删除对应的token_key，置空
    await RefreshTokenModel.update({
        token_key: ""
    }, {
        where: {
            token_key: oldTokenKey
        }
    })
    // 生成token，根据用户id
    const token = await jwtUtils.setToken(user.id)
    // 返回token的md5值，token保存在redis中
    // 前端访问的时候，携带token的md5，从redis中获取
    const tokenKey = CryptoJS.MD5(token)
    // 保存在redis中,两小时过期
    redis.setString(Constants.User.TOKEN_KEY + tokenKey, token, Constants.TimeSecound.TWO_HOUR)
    // 将tokenKey写入cookie中，需要动态获取的话直接从request.cookies拿取
    // TODO:
    // utils.setCookieKey(res, Constants.User.USER_COOKIE_DATA, tokenKey, Constants.TimeSecound.DAY)
    // 首先判断数据库中refreshToken存在吗，如果存在就更新，否者就建立
    const refreshToken = await RefreshTokenModel.findOne({
        where: {
            user_id: user.id
        }
    })
    if (refreshToken == null) {
        await RefreshTokenModel.create({
            user_id: user.id,
            create_time: new Date()
        })
    }
    //不管是过期了还是重新登陆，都生成/更新refreshToken
    const refreshTokenValue = await jwtUtils.setToken(user.id)
    // 保存到数据库
    await RefreshTokenModel.create({
        refresh_token: refreshTokenValue,
        create_time: new Date()
    })
    return tokenKey
}

module.exports = router