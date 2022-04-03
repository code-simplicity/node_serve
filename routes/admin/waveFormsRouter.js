const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const loginAuth = require("../../middleware/loginAuth")
const waveFormsController = require("../../controller/admin/waveFormsController")
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
});

/**
 * 上传波形图
 * /admin/waveforms/upload
 */
router.post("/waveforms/upload", upload.single("image"), loginAuth, async (req, res) => {
    await waveFormsController.uploadWaveForms(req.body, req.file, res)
})

/**
 * 显示所有波形图
 * /admin/waveforms/findAll
 */
router.get("/waveforms/findAll", loginAuth, async (req, res) => {
    await waveFormsController.waveFormsFindAll(req.query, res)
})

/**
 * 修改波形图
 * /admin/waveforms/update
 */
router.put("/waveforms/update", upload.single("image"), loginAuth, async (req, res) => {
    await waveFormsController.updateWaveForms(req.body, req.file, res)
})

/**
 * 删除波形图
 * /admin/waveforms/delete
 */
router.delete("/waveforms/delete", loginAuth, async (req, res) => {
    await waveFormsController.deleteWaveForms(req.body, res)
})

/**
 * 查找港口点位下所有的波形图
 * /admin/waveforms/pointIds/findAll
 */
router.post("/waveforms/pointIds/findAll", loginAuth, async (req, res) => {
    await waveFormsController.findAllWaveFormsPointIds(req.body, res)
})

/**
 * 批量删除
 * /admin/waveforms/pointIds/findAll
 */
router.delete("/waveforms/batch/delete", loginAuth, async (req, res) => {
    await waveFormsController.batchDeleteWaveForms(req.body, res)
})

module.exports = router