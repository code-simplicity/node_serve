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
        try {
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
            if (dataValues !== null) {
                return res.send(new SuccessModel("注册成功"))
            } else {
                return res.send(new FailModel("注册失败"))
            }
        } catch (error) {
            return res.send(new FailModel("注册失败"))
        }
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
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("图灵验证码不正确"))
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
        // 将这个tokenKey和id返回给前端，之后前端将这个tokenKey保存，然后通过设置在headers.authorization来验证码接口
        const tokenKeyValue = `Bearer,${tokenKey}`
        const {
            user_name,
            sex,
            score,
            email,
            roles
        } = user.dataValues
        return res.send(new SuccessModel({
            tokenKey: tokenKeyValue,
            id,
            user_name,
            sex,
            score,
            email,
            roles
        }, "登录成功"))
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
    },

    /**
     * 更新用户信息
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async updateUserInfo(args, req, res) {
        /**
         * id，用户名。性别，图灵验证码
         */
        const {
            id,
            user_name,
            sex,
            captcha
        } = args
        // 判断图灵验证码是否正确
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

        // 找到用户的相关信息
        const {
            dataValues
        } = await serverUser.getUserInfo(id)
        // 判断两个id是否相等
        if (dataValues.id !== id) {
            return res.status(resCode.NoAuthority.code).send(new FailModel(resCode.NoAuthority.codeMsg))
        }
        // 可以进行修改了
        if (utils.isEmpty(user_name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("姓名不可以为空"))
        }
        if (utils.isEmpty(sex)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("性别不可以为空"))
        }
        const params = {
            id,
            user_name,
            sex,
        }
        const [result] = await serverUser.updateUserInfo(params)
        // 更新成功
        if (result) {
            // 干掉redis中的token,下一次重新建立一个
            const tokenKey = utils.getCookieKey(req.cookies, Constants.User.USER_COOKIE_DATA)
            redis.delString(Constants.User.TOKEN_KEY + tokenKey)
            return res.send(new SuccessModel(params, "用户信息更新成功"))
        } else {
            return res.send(new FailModel("用户信息更新失败"))
        }
    },

    /**
     * 重置密码
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async resetPassWord(args, req, res) {
        const {
            id,
            password,
            captcha
        } = args
        // 判断图灵验证码是否正确
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
        if (utils.isEmpty(id)) {
            return res.send(new FailModel("学号不可以为空"))
        }
        if (utils.isEmpty(password)) {
            return res.send(new FailModel("密码不可以为空"))
        }
        if (password.length !== 32) {
            return res.send(new FailModel("请使用md5进行加密"))
        }
        const {
            dataValues
        } = await serverUser.getUserInfo(id)
        if (dataValues === null) {
            return res.send(new FailModel("该用户不存在"))
        }
        // 对密码进行加密入库
        const param = {
            id,
            password: utils.desEncrypt(password, Constants.User.PASSWORD_MESSAGE)
        }
        const [update] = await serverUser.resetPassWord(param)
        if (update) {
            return res.send(new SuccessModel("重置密码成功"))
        } else {
            return res.send(new FailModel("重置密码失败"))
        }
    },

    /**
     * 重置密码
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async logout(req, res) {
        // 拿到token_key
        const tokenKey = utils.getCookieKey(req.cookies, Constants.User.USER_COOKIE_DATA)
        if (utils.isEmpty(tokenKey)) {
            return res.send(new FailModel("账户未登陆"))
        }
        // 删除redis中的token
        redis.delString(Constants.User.TOKEN_KEY + tokenKey)
        // 删除mysql中的refreshtoken
        await serverRefreshToken.updateRefreshToken(tokenKey)
        // 删除cookie中的token_key
        utils.delCookieKey(res, Constants.User.USER_COOKIE_DATA)
        return res.send(new SuccessModel("退出登录成功"))
    },

    /**
     * 添加得分
     * @param {} args 
     * @param {*} res 
     * @returns 
     */
    async addUserScore(args, res) {
        const {
            id,
            score
        } = args
        if (score > 100 || score < 0) {
            return res.send(new FailModel(`当前输入得分为${score}：得分不能低于0，不能超过100.`))
        }
        if (utils.isEmpty(id)) {
            return res.send(new FailModel("学号不可以为空"))
        }
        const params = {
            id,
            score
        }
        const [result] = await serverUser.addUserScore(params)
        if (result) {
            return res.send(new SuccessModel({
                score: score
            }, `当前获得分数：${score}分.`))
        }
    },

    /**
     * 重置邮箱
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     */
    async resetUserEmail(args, req, res) {
        const {
            id,
            email,
            emailCode,
            captcha
        } = args
        // 首先判断用户id，邮箱，验证码是否存在
        if (utils.isEmpty(id)) {
            return res.send(new FailModel("用户id不可以为空"))
        }
        if (utils.isEmpty(email)) {
            return res.send(new FailModel("邮箱不可以为空"))
        }
        if (utils.isEmpty(emailCode)) {
            return res.send(new FailModel("邮箱验证码不可以为空"))
        }
        if (utils.isEmpty(captcha)) {
            return res.send(new FailModel("图灵验证码不可以为空"))
        }
        // 首先判断邮箱是否存在，存在其实就不用更改
        const emailInfo = await serverUser.checkEmail(email)
        // 邮箱已经存在
        if (emailInfo !== null) {
            return res.send(new FailModel("邮箱已存在"))
        }
        // 检验邮箱验证码
        // 从redis中读取邮箱验证码，判断输入的验证码和redis中是否一致
        const emailVerifyCode = await redis.getString(Constants.User.EMAIL_CODE + email)
        if (utils.isEmpty(emailVerifyCode)) {
            return res.send(new FailModel("邮箱验证码已过期"))
        }
        if (emailVerifyCode !== emailCode) {
            return res.send(new FailModel("邮箱验证码不正确"))
        } else {
            // 删除redis中的邮箱验证码
            redis.delString(Constants.User.EMAIL_CODE + email)
        }
        // 验证图灵验证码
        const captchaKey = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
        // 通过key读取redis中的相关验证码
        const captchaValue = await redis.getString(Constants.User.CAPTCHA_CONTENT + captchaKey)
        if (utils.isEmpty(captchaValue)) {
            return res.send(new FailModel("图灵验证码已经过期"))
        }
        if (captcha !== captchaValue) {
            return res.send(new FailModel("图灵验证码不正确"))
        } else {
            // 验证成功之后，删除redis的验证码
            redis.delString(Constants.User.CAPTCHA_CONTENT + captchaKey)
        }
        const params = {
            id,
            email
        }
        // 一致那就更新邮箱
        const [result] = await serverUser.updateUserEmail(params)
        if (result) {
            return res.send(new SuccessModel("邮箱更新成功"))
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