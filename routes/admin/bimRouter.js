/**
 * 港口点位图波形数据excel
 */
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const loginAuth = require("../../middleware/loginAuth")
const bimController = require("../../controller/admin/bimController")
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
})

/**
 * 上传三维模型file
 * /admin/bim/upload
 */
router.post("/bim/upload", upload.single("file"), loginAuth, async (req, res) => {
    await bimController.uploadBim(req.file, res)
})

/**
 * 获取全部三维模型
 * /admin/bim/findAll
 */
router.get("/bim/findAll", loginAuth, async (req, res) => {
    await bimController.bimFindAll(req.query, res)
})

/**
 * 更新三维模型
 * /admin/bim/update
 */
router.put("/bim/update", upload.single("file"), loginAuth, async (req, res) => {
    await bimController.updateBim(req.body, req.file, res)
})

/**
 * 删除三维模型
 * /admin/bim/delete
 */
router.delete("/bim/delete", loginAuth, async (req, res) => {
    await bimController.deleteBim(req.body, res)
})

/**
 * 批量删除三维模型
 * /admin/bim/pointIds/findAll
 */
router.delete("/bim/batch/delete", loginAuth, async (req, res) => {
    await bimController.batchDeleteBim(req.body, res)
})

module.exports = router