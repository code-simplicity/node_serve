// 连接数据库
const config = require("./config");

// 导入redis连接
const redis = require("redis")

// 创建redisClient
const redisClient = redis.createClient(config.redisDB.port, config.redisDB.url)
//验证redis
redisClient.auth(config.redisDB.password)
redisClient.on('ready', () => {
    console.log('redis ready success');
})
redisClient.on('connect', () => {
    console.log('redis connect success');
})

redisClient.on("error", err => {
    console.log('redis connect err', err);
});

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

/**
 * getString方法
 * @param {*} key 获取key
 * @returns 
 */
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

/**
 * 删除redis中的key
 * @param {*} key 
 */
const delString = (key) => {
    redisClient.del(key, (err, res) => {
        if (err) {
            console.log(err)
        } else {
            console.log(`redis中的key${key}删除成功`, res)
        }
    })
}

module.exports = {
    redisClient,
    setString,
    getString,
    delString
}