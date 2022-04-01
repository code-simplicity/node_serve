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

/**
 * 退出登录
 * /admin/user/logout
 */
router.get("/user/logout", loginAuth, async (req, res) => {
    await userController.logout(req, res)
})

/**
 * 获取用户列表
 * /admin/user/list
 */
router.post("/user/list", loginAuth, async (req, res) => {
    await userController.getUserList(req.body, res)
})

/**
 * 搜索用户
 * /admin/user/list/search
 */
router.post("/user/list/search", async (req, res) => {
    await userController.getUserListSearch(req.body, res)
})

/**
 * 添加用户
 * /admin/user/add
 */
router.post("/user/add", loginAuth, async (req, res) => {
    await userController.addUser(req.body, res)
})

/**
 * 修改用户信息
 * /admin/user/update
 */
router.put("/user/update", loginAuth, async (req, res) => {
    await userController.updateUser(req.body, res)
})

/**
 * 删除用户
 * /admin/user/delete
 */
router.delete("/user/delete", loginAuth, async (req, res) => {
    await userController.deleteUser(req.body, res)
})

/**
 * 批量删除
 * /admim/user/batch/delete
 */
router.delete("/user/batch/delete", loginAuth, async (req, res) => {
    await userController.batchDeleteUser(req.body, res)
})

/**
 * 重置学号
 * /admin/user/reste/user-id
 */
router.put("/user/reset/user-id", loginAuth, async (req, res) => {
    await userController.resetUserId(req.body, res)
})
module.exports = router