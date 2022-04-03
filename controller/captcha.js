/**
 * 发送验证码
 */
const svgCaptcha = require('svg-captcha');
const Constants = require("../utils/Constants")
const utils = require("../utils/utils");
const redis = require("../config/redis")
const {
    v4: uuidv4
} = require('uuid');

const captcha = {
    async sendCaptcha(req, res) {
        // 首先检查上一次请求的用户的id是否存在，如果存在就继续使用，如果不存在，那么新起一个
        // 先判断是否有cookie存在
        const lastId = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
        let key = ""
        if (utils.isEmpty(lastId)) {
            key = uuidv4()
        } else {
            key = lastId
        }
        // 获取图灵验证码
        const captcha = svgCaptcha.create({
            size: 4,
            noise: 1,
            color: true,
            background: '#DBDBDB',
            height: 32,
            width: 100,
            fontSize: 36,
            ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
        })
        // 发送类型为svg
        res.type("svg")
        /**
         * 保存在redis中，
         * 规则是：
         * 1、10分钟以后删除
         * 2、使用之后删除
         * 3、使用的情况看get
         */
        // 忽略大小写
        let text = captcha.text.toLowerCase()
        utils.setCookieKey(res, Constants.User.LAST_CAPTCHA_ID, key, Constants.TimeSecound.DAY)
        redis.setString(Constants.User.CAPTCHA_CONTENT + key, text, Constants.TimeSecound.TEN_MIN)
        // 这个是发送给前端展示的
        return res.send(captcha.data)
    }
}

module.exports = captcha