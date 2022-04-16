/**
 * 港口点位图波形数据excel
 */
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const loginAuth = require("../../middleware/loginAuth")
const waveDataExcelController = require("../../controller/admin/waveDataExcelController")
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
})

/**
 * 上传港口点位统计结果excel
 * /admin/wavedataexcel/upload
 */
router.post("/wavedataexcel/upload", upload.single("excel"), loginAuth, async (req, res) => {
    await waveDataExcelController.uploadWaveDataExcel(req.body, req.file, res)
})

/**
 * 获取全部港口点位统计结果excel
 * /admin/wavedataexcel/findAll
 */
router.get("/wavedataexcel/findAll", loginAuth, async (req, res) => {
    await waveDataExcelController.waveDataExcelFindAll(req.query, res)
})

/**
 * 更新港口点位统计结果excel
 * /admin/wavedataexcel/update
 */
router.put("/wavedataexcel/update", upload.single("excel"), loginAuth, async (req, res) => {
    await waveDataExcelController.updateWaveDataExcel(req.body, req.file, res)
})

/**
 * 删除港口点位统计结果excel
 * /admin/wavedataexcel/delete
 */
router.delete("/wavedataexcel/delete", loginAuth, async (req, res) => {
    await waveDataExcelController.deleteWaveDataExcel(req.body, res)
})

/**
 * 批量删除港口点位统计结果excel
 * /admin/wavedataexcel/pointIds/findAll
 */
router.delete("/wavedataexcel/batch/delete", loginAuth, async (req, res) => {
    await waveDataExcelController.batchDeleteWaveDataExcel(req.body, res)
})

module.exports = router