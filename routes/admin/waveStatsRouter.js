const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const loginAuth = require("../../middleware/loginAuth")
const waveStatsController = require("../../controller/admin/waveStatsController")
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
});

/**
 * 上传波形统计图
 * /admin/wavestats/upload
 */
router.post("/wavestats/upload", upload.single("image"), loginAuth, async (req, res) => {
    await waveStatsController.uploadWaveStats(req.body, req.file, res)
})

/**
 * 显示所有波形统计图
 * /admin/wavestats/findAll
 */
router.get("/wavestats/findAll", loginAuth, async (req, res) => {
    await waveStatsController.waveStatsFindAll(req.query, res)
})

/**
 * 修改波形统计图
 * /admin/wavestats/update
 */
router.put("/wavestats/update", upload.single("image"), loginAuth, async (req, res) => {
    await waveStatsController.updateWaveStats(req.body, req.file, res)
})

/**
 * 删除波形统计图
 * /admin/wavestats/delete
 */
router.delete("/wavestats/delete", loginAuth, async (req, res) => {
    await waveStatsController.deleteWaveStats(req.body, res)
})

/**
 * 查找港口点位下所有的波形统计图
 * /admin/wavestats/pointIds/findAll
 */
router.post("/wavestats/pointIds/findAll", loginAuth, async (req, res) => {
    await waveStatsController.findAllWaveStatsPointIds(req.body, res)
})

/**
 * 批量删除
 * /admin/wavestats/pointIds/findAll
 */
router.delete("/wavestats/batch/delete", loginAuth, async (req, res) => {
    await waveStatsController.batchDeleteWaveStats(req.body, res)
})
module.exports = router