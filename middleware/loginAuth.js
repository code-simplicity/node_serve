/**
 * 登录验证
 */
const {
    FailModel
} = require("../response/response")
const resCode = require("../utils/resCode")
const refreshTokenServer = require("../server/portal/refreshToken")
const jwtUtils = require("../utils/jwtUtils")
const Constants = require("../utils/Constants")
const redis = require("../config/redis")
const loginAuth = async (req, res, next) => {
    // 这里我们从redis中拿去这个tokenKey,大概是这样P_cd051f4acac232eebfe9f55c2b2777ef
    const tokenKey = String(req.headers.authorization || "").split(",").pop()
    console.log("tokenKey", tokenKey)
    // 获取tokenKey的头部
    const token = await redis.getString(Constants.User.TOKEN_KEY + tokenKey)
    // 验证荷载 
    let payload = await jwtUtils.verToken(token)
    console.log("payload", payload)
    console.log("token ====>", token)
    if (token) {
        if (payload === undefined || payload === "" || payload === -1) {
            // token失效，删除掉redis中的token
            await redis.delString(Constants.User.TOKEN_KEY + tokenKey)
            res.status(401).send({
                code: resCode.SessionExpired.code,
                codeMsg: resCode.SessionExpired.codeMsg,
                msg: "token失效，请重新登录！"
            })
        } else {
            // 权限校验,判断refresh存在token吗，如果存在，就将这个token给前端
            req.user = await refreshTokenServer.getRefreshTokenByUserId(payload.id)
            if (!req.user) {
                // user不存在就删除掉redis中的token
                await redis.delString(Constants.User.TOKEN_KEY + tokenKey)
                res.status(401).send(
                    new FailModel("请先登录")
                )
            }
            next()
        }
    } else {
        await redis.delString(Constants.User.TOKEN_KEY + tokenKey)
        res.status(401).send({
            code: resCode.ArgsError.status,
            codeMsg: resCode.ArgsError.codeMsg,
            msg: "token 不存在"
        })
    }
}

module.exports = loginAuth