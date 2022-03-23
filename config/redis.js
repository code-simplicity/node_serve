// 连接数据库
const {
    redisConfig
} = require("./config");

// 导入redis连接
const redis = require("redis")

// 创建redisClient
const redisClient = redis.createClient(redisConfig.port, redisConfig.host)

// 启动
redisClient.on("ready", res => {
    console.log("redis启动了", res)
})

// 失败
redisClient.on("error", err => {
    console.log("redis启动失败", err)
})

module.exports = {
    redisClient
}