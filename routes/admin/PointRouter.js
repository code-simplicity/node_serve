const express = require("express");
const router = express.Router();
const pointController = require("../../controller/admin/pointController")
const loginAuth = require("../../middleware/loginAuth")

/**
 * 添加点位
 * /admin/point/add
 */
router.post("/point/add", loginAuth, async (req, res) => {
    await pointController.addPoint(req.body, res)
})

/**
 * 获取所有点我
 * /admin/point/findAll
 */
router.get("/point/findAll", loginAuth, async (req, res) => {
    await pointController.getPointFindAll(req.query, res)
})

/**
 * 删除点位
 * /admin/point/delete
 */
router.delete("/point/delete", loginAuth, async (req, res) => {
    await pointController.deletePoint(req.body, res)
})

/**
 * 修改点位信息
 * /admin/point/update
 */
router.put("/point/update", loginAuth, async (req, res) => {
    await pointController.updatePoint(req.body, res)
})

/**
 * 搜索点位
 * /admin/point/search
 */
router.get("/point/search", loginAuth, async (req, res) => {
    await pointController.searchPoint(req.query, res)
})

/**
 * 批量删除点位
 * /admin/point/batch/delete
 */
router.delete("/point/batch/delete", loginAuth, async (req, res) => {
    await pointController.batchDeletePoint(req.body, res)
})

module.exports = router