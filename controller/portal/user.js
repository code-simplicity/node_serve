const jwt = require("jsonwebtoken")
const CryptoJS = require("crypto-js")
const serverUser = require("../../server/portal/user")
const serverRefreshToken = require("../../server/portal/refreshToken")
const UserModel = require("../../models/UserModel")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const redis = require("../../config/redis")
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const jwtUtils = require("../../utils/jwtUtils");

const user = {
    /**
     * 用户注册
     * @param {*} args 
     * @param {*} req 
     */
    async register(args, req, res) {
        let {
            id,
            user_name,
            password,
            sex,
            email,
            emailCode,
            captcha
        } = args
        // 获取用户信息，判断该用户是否存在
        const user = await serverUser.getUserInfo(id)
        if (user !== null) {
            // 存在那么就返回该用户已经存在
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("用户已存在"))
        }
        const emailInfo = await serverUser.checkEmail(email)
        // 邮箱已经存在
        if (emailInfo !== null) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("邮箱已存在"))
        }
        // 检验邮箱验证码
        const emailVerifyCode = await redis.getString(Constants.User.EMAIL_CODE + email)
        if (utils.isEmpty(emailVerifyCode)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("邮箱验证码已过期"))
        }
        if (emailVerifyCode !== emailCode) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("邮箱验证码不正确"))
        } else {
            // 删除redis中的邮箱验证码
            redis.delString(Constants.User.EMAIL_CODE + email)
        }
        // 验证图灵验证码
        const captchaKey = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
        // 通过key读取redis中的相关验证码
        const captchaValue = await redis.getString(Constants.User.CAPTCHA_CONTENT + captchaKey)
        if (utils.isEmpty(captchaValue)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("图灵验证码已经过期"))
        }
        if (captcha !== captchaValue) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("图灵验证码不正确"))
        } else {
            // 验证成功之后，删除redis的验证码
            redis.delString(Constants.User.CAPTCHA_CONTENT + captchaKey)
        }
        // 判断密码是否通过crypto进行摘要计算，32位
        if (password.length !== 32) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请使用MD5进行摘要计算"))
        }
        // 对密码进行加密入库
        password = utils.desEncrypt(password, Constants.User.PASSWORD_MESSAGE)
        const params = {
            id: id,
            user_name: user_name,
            password: password,
            sex: sex,
            email: email,
        }
        const {
            dataValues
        } = await serverUser.register(params)
        return dataValues !== null ? 1 : 0
    },

    async login(args, req, res) {
        // 登录可以使用学号+密码或者邮箱+密码
        // 机械验证码和来自哪里
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
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("账户不可以为空"))
        }
        if (utils.isEmpty(password)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不可以为空"))
        }
        // 查找用户
        const user = await serverUser.getUserInfo(id)
        if (user === null) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("用户名或者密码不正确"))
        }
        // 用户存在
        // 对比密码是否一致
        // 解密
        const desPassword = utils.desDecrypt(user.dataValues.password, Constants.User.PASSWORD_MESSAGE)
        if (password !== desPassword) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不正确"))
        }
        // 判断用户是否存在
        if ("1" !== user.dataValues.state) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("该用户不存在或者已经被拉黑"))
        }
        // 创建token，删除cookie
        const tokenKey = await createToken(req.cookies, user.dataValues, from)
        // 将tokenKey写入cookie中，需要动态获取的话直接从request.cookies拿取
        // 设置cookie，
        console.log("tokenKey ==== >", tokenKey)
        utils.setCookieKey(res, Constants.User.USER_COOKIE_DATA, tokenKey, Constants.TimeSecound.TEN_DAY)
        // 删除验证码创建的LAST_CAPTCHA_ID的cookie
        utils.delCookieKey(res, Constants.User.LAST_CAPTCHA_ID)
        return res.send(new SuccessModel("登录成功"))
    },

    /**
     * 获取用户信息
     * @param {*} args ,通过id
     * @returns 
     */
    async getUserInfo(args, res) {
        const {
            id
        } = args
        const result = await serverUser.getUserInfo(id)
        console.log("result", result)
        if (!result) {
            return res.send(new FailModel("用户不存在"))
        } else {
            const {
                password,
                ...params
            } = result.dataValues
            return res.send(new SuccessModel(params, "获取用户信息成功"))
        }
    }
}

/**
 * 检查用户是否登录，如果登录就返回用户信息
 * @param {*} request 请求
 */
async function checkUser(request) {
    // 首先是拿到token_key
    const tokenKey = utils.getCookieKey(request.cookies, Constants.User.USER_COOKIE_DATA)
    console.log("user tokenKey", tokenKey)
    if (utils.isEmpty(tokenKey)) {
        return null
    }
    // 解析token信息
    const userInfo = await parseByTokenKey(tokenKey)
    console.log("userinfo ==>", userInfo)
    if (userInfo === null) {
        // 说明是解析出错，那么token就过期了，我们可以从refreshtoken表中查询是否存在
        const refreshToken = await RefreshTokenModel.findOne({
            where: {
                refresh_token: tokenKey
            }
        })
        if (refreshToken === null) {
            console.log("refreshToken is null")
            return null
        }
        // 存在就解析
        try {
            jwtUtils.verToken(refreshToken.dataValues.refresh_token)
            // 如果这个token存在，那么就创建新的token和refresh_token
            const userId = refreshToken.dataValues.user_id
            const userForm = await UserModel.findOne({
                where: {
                    id: userId
                }
            })
            // 删除refresh_token的记录
            const newTokenKey = createToken(request.cookies, userForm)
            console.log("正在创建新的tokenkey")
            return parseByTokenKey(newTokenKey)
        } catch (error) {
            console.log('refresh_token 过期了')
            return null
        }
    }
    return userInfo
}

/**
 * 创建token
 * @param {*} request 请求
 * @param {*} response 响应
 * @param {*} user 用户信息
 * @param {*} from 来自设备
 */
async function createToken(request, user, from) {
    const oldTokenKey = utils.getCookieKey(request, Constants.User.USER_COOKIE_DATA)
    console.log("oldTokenKey ==>", oldTokenKey)
    // 不能干掉
    const oldRefreshToken = await serverRefreshToken.getRefreshTokenByUserId(user.id)
    // 判断来源是否一致
    if (Constants.App.FROM_PC === from) {
        if (oldRefreshToken !== null) {
            redis.delString(Constants.User.TOKEN_KEY + oldRefreshToken.dataValues.token_key)
        }
        console.log("oldRefreshToken ==>", oldRefreshToken)
        //删除对应的token_key，置空
        await serverRefreshToken.updateRefreshToken(oldTokenKey)
    }
    // 生成token，根据用户id,保存时间为10天
    // 对对象进行解构，移除密码
    const {
        password,
        ...userForm
    } = user
    const claims = {
        ...userForm,
        from: from
    }
    const token = await jwtUtils.setToken(claims)
    // 返回token的md5值，token保存在redis中
    // 前端访问的时候，携带token的md5，从redis中获取
    const tokenKey = from + CryptoJS.MD5(token).toString()
    console.log("createToken token", token)
    console.log("createToken tokenKey", tokenKey)
    // 保存在redis中,一小时过期
    redis.setString(Constants.User.TOKEN_KEY + tokenKey, token, Constants.TimeSecound.DAY)
    // 首先判断数据库中refreshToken存在吗，如果存在就更新，否者就建立
    const refreshToken = await serverRefreshToken.getRefreshTokenByUserId(user.id)
    //不管是过期了还是重新登陆，都生成/更新refreshToken
    const refreshTokenValue = await jwtUtils.setToken(user.id)
    console.log("refreshTokenValue ==>", refreshTokenValue)
    // 保存到数据库
    const param = {
        user_id: user.id,
        refresh_token: refreshTokenValue,
        create_time: new Date()
    }
    if (refreshToken === null) {
        await serverRefreshToken.createRefreshToken(param)
    }
    return tokenKey
}

/**
 * 解析token的信息
 * @param {*} tokenKey 
 */
async function parseByTokenKey(tokenKey) {
    console.log('tokenKey ====>', tokenKey)
    const token = await redis.getString(Constants.User.TOKEN_KEY + tokenKey)
    console.log("token ==>", token)
    if (token !== null) {
        // 解析token
        try {
            const {
                id
            } = await jwtUtils.verToken(token)
            console.log("id ==>", id)
            return id
        } catch (error) {
            console.log('token过期了', token过期了)
            return null
        }
    }
    return null
}

module.exports = user