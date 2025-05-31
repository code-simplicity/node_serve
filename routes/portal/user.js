const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js")
// 导入暴露的模型
const UserModel = require("../../models/UserModel");
const RefreshTokenModel = require("../../models/RefreshTokenModel");
const jwtUtils = require("../../utils/jwtUtils");
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const R = require("../../utils/R")
const redis = require("../../config/redis")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const model = require("../../server/portal/user")
const userController = require("../../controller/portal/user")
// token检查
const loginAuth = require("../../middleware/loginAuth");


/**
 * @api {post} /portal/user/add 用户注册接口
 * @apiDescription 用户注册接口
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/add
 * @apiVersion 1.0.0
 */
router.post("/user/add", async (req, res) => {
    // 用户名，密码，学号，性别，邮箱地址，图灵验证码
    await userController.register(req.body, req, res)
    // 注意：响应已经在controller中处理，此处不需要再发送响应
});

/**
 * @api {post} /portal/user/login 用户登录接口
 * @apiDescription 用户登录接口
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/login
 * @apiVersion 1.0.0
 */
router.post("/user/login", async (req, res) => {
    await userController.login(req.body, req, res)
})

/**
 * @api {post} /portal/user/info 获取用户信息
 * @apiDescription 获取用户信息
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiSampleRequest http://localhost:5050/portal/user/info
 * @apiVersion 1.0.0
 */
router.get("/user/info", loginAuth, async (req, res) => {
    await userController.getUserInfo(req.query, res)
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
router.put("/user/update/info", loginAuth, async (req, res) => {
    await userController.updateUserInfo(req.body, req, res)
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
router.put("/user/reset-password", loginAuth, async (req, res) => {
    await userController.resetPassWord(req.body, req, res)
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
router.get("/user/logout", loginAuth, async (req, res) => {
    await userController.logout(req, res)
});

/**
 * @api {get} /portal/user/count 获取用户总数
 * @apiDescription 获取用户总数
 * @apiName 门户
 * @apiGroup PortalUser
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
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/add/score
 * @apiVersion 1.0.0
 */
router.post("/user/add/score", loginAuth, async (req, res) => {
    await userController.addUserScore(req.body, res)
});

/**
 * @api {get} /portal/user/reset-email 重置邮箱
 * @apiDescription 重置邮箱
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/reset-email
 * @apiVersion 1.0.0
 */
router.put("/user/reset-email", loginAuth, async (req, res) => {
    await userController.resetUserEmail(req.body, req, res)
})

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