const express = require("express");
const router = express.Router();
const chooseController = require("../../controller/admin/chooseController")
const loginAuth = require("../../middleware/loginAuth")

/**
 * 添加选择
 * /admin/choose/add
 */
router.post("/choose/add", loginAuth, async (req, res) => {
    await chooseController.addChoose(req.body, res)
})
/**
 * 获取所有的选择数据
 * /admin/choose/findAll
 */
router.get("/choose/findAll", loginAuth, async (req, res) => {
    await chooseController.getChooseFindAll(req.query, res)
})

/**
 * 修改内容
 * /admin/choose/update
 */
router.put("/choose/update", loginAuth, async (req, res) => {
    await chooseController.updateChoose(req.body, res)
})

/**
 * 删除选择
 */
router.delete("/choose/delete", loginAuth, async (req, res) => {
    await chooseController.deleteChoose(req.body, res)
})

/**
 * 批量删除
 */
router.delete("/choose/batch/delete", loginAuth, async (req, res) => {
    await chooseController.batchDeleteChoose(req.body, res)
})

module.exports = router