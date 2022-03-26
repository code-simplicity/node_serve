/**
 * 登录验证
 */
const {
    FailModel
} = require("../response/response")
const resCode = require("../utils/resCode")
const userServer = require("../server/portal/user")
const jwt = require("jsonwebtoken");
const jwtUtils = require("../utils/jwtUtils")
const Constants = require("../utils/Constants")
const loginAuth = async (req, res, next) => {
    // 获取tokenKey的头部
    const token = String(req.headers.authorization || "").split(" ").pop
    // 验证荷载 
    let payload = await jwtUtils.verToken(token)
    console.log("payload", payload)
    console.log("token ====>", token)
    if (token) {
        if (payload === undefined || payload === "" || payload === -1) {
            res.status(401).send({
                code: resCode.SessionExpired.code,
                codeMsg: resCode.SessionExpired.codeMsg,
                msg: "token失效，请重新登录！"
            })
        } else {
            // 权限校验
            req.user = await userServer.getUserInfo(payload.id)
            if (!req.user) {
                res.status(401).send(
                    new FailModel("请先登录")
                )
            }
            next()
        }
    } else {
        res.status(401).send({
            code: resCode.ArgsError.status,
            codeMsg: resCode.ArgsError.codeMsg,
            msg: "token 不存在"
        })
    }
}

module.exports = loginAuth