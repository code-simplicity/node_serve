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
    setToken(id) {
        return new Promise((resolve, reject) => {
            // token过期时间为10天过期
            const token = jwt.sign({
                id
            }, Constants.User.USER_COOKIE_DATA, {
                expiresIn: 10 * 24 * 60 * 60
            })
            resolve(token);
        })
    },

    // 解析token
    // verToken(token) {
    //     return new Promise((resolve, reject) => {
    //         jwt.verify(token, Constants.User.USER_COOKIE_DATA, {
    //             algorithms: ['HS256']
    //         }, (err, decoded) => {
    //             if (err) {
    //                 reject(-1)
    //             } else {
    //                 resolve(decoded)
    //             }
    //         })
    //     })
    // },

    async verToken(token) {
        const data = jwt.verify(token, Constants.User.USER_COOKIE_DATA, {
            algorithms: ['HS256']
        }, (err, decoded) => err ? -1 : decoded)
        console.log("data", data)
        return data
    },

    // token验证
    jwtAuth
}