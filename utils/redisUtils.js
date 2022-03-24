/**
 * redis工具
 */

const {
    redisClient
} = require("../config/redis")

/**
 * 
 * @param {*} key 存放的关键字
 * @param {*} value 具体的值
 * @param {*} expire 过期时间
 * @returns 
 */
const setString = (key, value, expire) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, (err, res) => {
            if (err) {
                console.log("err", err)
                reject(err)
            }
            if (!isNaN(expire) && expire > 0) {
                redisClient.expire(key, parseInt(expire))
            }
            resolve(res)
        })
    })
}

const getString = (key) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, res) => {
            if (err) {
                console.log("err", err)
                reject(err)
            }
            resolve(res)
        })
    })
}

module.exports = {
    setString,
    getString
}