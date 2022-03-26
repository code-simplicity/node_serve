/**
 * 图灵验证码获取
 */
const express = require("express");
const router = express.Router();
const controller = require("../controller/captcha")

/**
 * 获取图灵验证码
 * http://localhost:5050/captcha
 */
router.get("/captcha", async (req, res) => {
    // 首先检查上一次请求的用户的id是否存在，如果存在就继续使用，如果不存在，那么新起一个
    // 先判断是否有cookie存在
    await controller.sendCaptcha(req, res)
})

module.exports = router;