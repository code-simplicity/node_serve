const jwt = require('jsonwebtoken')
const expressJwt = require("express-jwt");

// 签名秘钥
const Constants = require("./Constants")

const jwtAuth = expressJwt({
    secret: Constants.User.USER_COOKIE_DATA,
    // 设置加密算法
    algorithms: ["HS256"],
    // 校验是否存在token，有token才可以访问
    credentialsRequired: false,
}).unless({
    path: ["/portal/user/login", "/portal/user/add", "/portal/user/check-token", "/captcha", "/portal/user/logout"],
})

module.exports = {
    // 生成token的方法
    async setToken(user) {
        const token = await jwt.sign({
            user
        }, Constants.User.USER_COOKIE_DATA, {
            expiresIn: "1h"
        })
        return token
    },

    // 解析token
    async verToken(token) {
        const {
            user
        } = jwt.verify(token, Constants.User.USER_COOKIE_DATA, {
            algorithms: ['HS256']
        }, (err, decoded) => err ? -1 : decoded)
        console.log("user", user)
        return user
    },

    // token验证
    jwtAuth
}