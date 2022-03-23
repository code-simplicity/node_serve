const express = require("express");
const router = express.Router();

const {
    Op
} = require("sequelize");

const R = require("../../utils/R")

const EmailSendUtils = require("../../utils/EmailSendUtils.js")

router.post("/sendMail", async (req, res) => {
    const {
        code,
        emaillAddress
    } = req.body
    const data = await EmailSendUtils.sendEmail(emaillAddress, code)
    if (data) {
        return res.send(R.success(data, "发送验证码成功."))
    } else {
        return res.send(R.fail("发送验证码失败."))
    }
})

module.exports = router;