const express = require("express");
const router = express.Router();
const userController = require("../../controller/admin/userController")
const loginAuth = require("../../middleware/loginAuth");
/**
 * 用户登录
 * /admin/user/login
 */
router.post("/user/login", async (req, res) => {
    await userController.login(req.body, req, res)
})

/**
 * 获取用户信息 
 * /admin/user/getUserInfo
 */
router.get("/user/getUserInfo", loginAuth, async (req, res) => {
    await userController.getUserInfo(req.query, res)
})

module.exports = router