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
    // 机械验证码和来自哪里
    let {
        captcha,
        from
    } = req.body
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
    // 创建token，删除cookie
    const tokenKey = await createToken(req.cookies, user.dataValues, from)
    // 将tokenKey写入cookie中，需要动态获取的话直接从request.cookies拿取
    // 设置cookie，
    console.log("tokenKey ==== >", tokenKey)
    utils.setCookieKey(res, Constants.User.USER_COOKIE_DATA, tokenKey, Constants.TimeSecound.TEN_DAY)
    // 删除验证码创建的LAST_CAPTCHA_ID的cookie
    utils.delCookieKey(res, Constants.User.LAST_CAPTCHA_ID)
    return res.send(R.success({}, "登录成功."))
})

/**
 * @api {post} /portal/user/info 获取用户信息
 * @apiDescription 获取用户信息
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiSampleRequest http://localhost:5050/portal/user/info
 * @apiVersion 1.0.0
 */
router.get("/user/info", async (req, res) => {
    const {
        id
    } = req.query
    // 从数据库中获取
    const user = await UserModel.findOne({
        where: {
            id
        }
    })
    if (user === null) {
        return res.send(R.fail("用户不存在."))
    }
    const {
        dataValues
    } = user
    // 将对象的密码进行解构
    const {
        password,
        ...newUserInfo
    } = dataValues
    return res.send(R.success(newUserInfo, "获取用户信息成功."))
})

/**
 * @api {put} /portal/user/update/info 更新用户信息
 * @apiDescription 更新用户信息
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} email="" 邮箱
 * @apiBody  {String} emailCode="" 邮箱验证码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/update/info
 * @apiVersion 1.0.0
 */
router.put("/user/update/info", async (req, res) => {
    // 这里更新的只有用户名和性别
    const user = req.body
    // 从token中解析user
    // 只有用户才能修改自己的信息
    const userFromTokenKey = await checkUser(req)
    console.log("userFromTokenKey ==》", userFromTokenKey)
    if (userFromTokenKey === null) {
        return res.send(R.fail("用户未登陆."))
    }
    // 找到用户的相关信息
    const {
        dataValues
    } = await UserModel.findOne({
        where: {
            id: userFromTokenKey.id
        }
    })
    // 判断两个id是否相等
    if (dataValues.id !== user.id) {
        return res.send(R.fail("没有权限操作."))
    }
    // 可以进行修改了
    if (utils.isEmpty(user.user_name) && user.user_name !== userFromTokenKey.user_name) {
        return res.send(R.fail("姓名不可以为空."))
    }
    if (utils.isEmpty(user.sex)) {
        return res.send(R.fail("性别不可以为空."))
    }
    const [update] = await UserModel.update(user, {
        where: {
            id: dataValues.id
        }
    })
    // 更新成功
    if (update) {
        // 干掉redis中的token,下一次重新建立一个
        const tokenKey = utils.getCookieKey(req.cookies, Constants.User.USER_COOKIE_DATA)
        redis.delString(Constants.User.TOKEN_KEY + tokenKey)
        return res.send(R.success({}, "用户信息更新成功."))
    } else {
        return res.send(R.fail("用户信息更新失败."))
    }
})

/**
 * @api {put} /portal/user/reset-password 重置密码
 * @apiDescription 重置密码
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} password="123456" 密码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/reset-password
 * @apiVersion 1.0.0
 */
router.put("/user/reset-password", async (req, res) => {
    const {
        id,
        password
    } = req.body
    if (utils.isEmpty(id)) {
        return res.send(R.fail("学号不可以为空."))
    }
    if (utils.isEmpty(password)) {
        return res.send(R.fail("密码不可以为空."))
    }
    if (password.length !== 32) {
        return res.send(R.fail("请使用md5进行加密."))
    }
    const user = await UserModel.findOne({
        where: {
            id
        }
    })
    if (user === null) {
        return res.send(R.fail("该用户不存在."))
    }
    // 对密码进行加密入库
    const [update] = await UserModel.update({
        password: utils.desEncrypt(password, Constants.User.PASSWORD_MESSAGE)
    }, {
        where: {
            id
        }
    })
    if (update) {
        return res.send(R.success({}, "重置密码成功."))
    }
})

/**
 * @api {get} /portal/user/logout 退出登录
 * @apiDescription 退出登录
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/logout
 * @apiVersion 1.0.0
 */
router.get("/user/logout", async (req, res) => {
    // 拿到token_key
    const tokenKey = utils.getCookieKey(req.cookies, Constants.User.USER_COOKIE_DATA)
    if (utils.isEmpty(tokenKey)) {
        return res.send(R.fail("账户未登陆."))
    }
    // 删除redis中的token
    redis.delString(Constants.User.TOKEN_KEY + tokenKey)
    // 删除mysql中的refreshtoken
    await RefreshTokenModel.update({
        token_key: ""
    }, {
        where: {
            token_key: tokenKey
        }
    })
    // 删除cookie中的token_key
    utils.delCookieKey(res, Constants.User.USER_COOKIE_DATA)
    return res.send(R.success({}, "退出登录成功."))
});

/**
 * @api {get} /portal/user/count 获取用户总数
 * @apiDescription 获取用户总数
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} password="123456" 密码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/count
 * @apiVersion 1.0.0
 */
router.get("/user/count", async (req, res) => {
    const {
        count
    } = await UserModel.findAndCountAll()
    return res.send(R.success(count, "获取用户总数成功."))
})

/**
 * @api {post} /portal/user/add/score 查询当前用户，并且添加得分
 * @apiDescription 查询当前用户，并且添加得分
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} score="0" 得分
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/add/score
 * @apiVersion 1.0.0
 */
router.post("/user/add/score", async (req, res) => {
    const {
        id,
        score
    } = req.body;
    if (score > 100 || score < 0) {
        return res.send(R.fail(`当前输入得分为${score}：得分不能低于0，不能超过100.`))
    }
    if (utils.isEmpty(id)) {
        return res.send(R.fail("学号不可以为空."))
    }
    // 更新查询
    const [update] = await UserModel.update({
        score: score,
    }, {
        where: {
            id: id,
        },
    })
    const {
        dataValues
    } = await UserModel.findOne({
        where: {
            id: id
        }
    })
    if (update || dataValues.score === score) {
        return res.send(R.success({
            score: score
        }, `当前获得分数：${score}分.`))
    } else {
        return res.send(R.fail("添加得分失败，视频未看完或者有其他任务未完成！"))
    }
});

/**
 * @api {get} /portal/user/check-token 检查用户是否登录
 * @apiDescription 检查用户是否登录
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} score="0" 得分
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/check-token
 * @apiVersion 1.0.0
 */
router.get("/user/check-token", async (req, res) => {
    const user = await checkUser(req)
    if (user === null) {
        return res.send(R.fail("用户未登录."))
    }
    return res.send(R.success(user, "获取用户成功."))
})

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
    const oldRefreshToken = await RefreshTokenModel.findOne({
        where: {
            user_id: user.id
        }
    })
    // 判断来源是否一致
    if (Constants.App.FROM_PC === from) {
        if (oldRefreshToken !== null) {
            redis.delString(Constants.User.TOKEN_KEY + oldRefreshToken.dataValues.token_key)
        }
        console.log("oldRefreshToken ==>", oldRefreshToken)
        //删除对应的token_key，置空
        await RefreshTokenModel.update({
            token_key: ""
        }, {
            where: {
                token_key: oldTokenKey == undefined ? "" : oldTokenKey
            }
        })
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
    const refreshToken = await RefreshTokenModel.findOne({
        where: {
            user_id: user.id
        }
    })
    //不管是过期了还是重新登陆，都生成/更新refreshToken
    const refreshTokenValue = await jwtUtils.setToken(user.id)
    console.log("refreshTokenValue ==>", refreshTokenValue)
    // 保存到数据库
    if (refreshToken == null) {
        await RefreshTokenModel.create({
            user_id: user.id,
            refresh_token: refreshTokenValue,
            create_time: new Date()
        })
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

module.exports = router