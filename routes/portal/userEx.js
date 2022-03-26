/**
 * 发送邮箱的接口
 */
const express = require("express");
const router = express.Router();
const controller = require("../../controller/portal/userEx")

/**
 * 发送邮箱验证码
 * emailAddress：邮箱地址
 * mustRegister：是否已经检查邮箱是否注册
 * http://localhost:5050/portal/userEx/sendMailCode
 */
router.post("/userEx/sendMailCode", async (req, res) => {
    await controller.sendEmail(req.body, req, res)
})

module.exports = router