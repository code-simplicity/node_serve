const jwt = require('jsonwebtoken')
// 签名
const jwtScrect = 'school_token'

module.exports = {
    // 生成token的方法
    setToken(id) {
        return new Promise((resolve, reject) => {
            // token过期时间为10天过期
            const token = jwt.sign({
                id
            }, jwtScrect, {
                expiresIn: 10 * 24 * 60 * 60
            })
            resolve(token);
        })
    },

    // 验证token
    verToken(token) {
        return new Promise((resolve, reject) => {
            const info = jwt.verify(token, jwtScrect, {
                algorithms: ['HS256']
            }, (err, decoded) => {
                if (err) {
                    reject(err)
                }
                console.log(decoded)
            })
            resolve(info)
        })
    },

    // 删除token，做退出登录的处理
    // delete
}