const express = require("express");
const router = express.Router();

const {
    Op
} = require("sequelize");

const R = require("../utils/R")

const utils = require("../utils/utils");

const EmailSendUtils = require("../../utils/EmailSendUtils.js")

router.post("/sendMail", async (req, res) => {
    const {
        code,
        email
    } = req.body
    const data = await EmailSendUtils.sendEmail(email, code)
    if (data) {
        return res.send(R.success(data, "发送验证码成功."))
    }
})