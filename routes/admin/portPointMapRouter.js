const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const loginAuth = require("../../middleware/loginAuth")
const portPointMapController = require("../../controller/admin/portPointMapController")
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
});

/**
 * 上传港口点位图
 * /admin/portpointmap/upload
 */
router.post("/portpointmap/upload", upload.single("image"), loginAuth, async (req, res) => {
    await portPointMapController.uploadPortPointMap(req.body, req.file, res)
})

/**
 * 获取港口点位地图
 */
router.get("/portpointmap/findAll", loginAuth, async (req, res) => {
    await portPointMapController.getPortPointMapFindAll(req.query, res)
})

/**
 * 修改港口地图信息
 * /admin/portpointmap/update
 */
router.put("/portpointmap/update", upload.single("image"), loginAuth, async (req, res) => {
    await portPointMapController.updatePortPointMap(req.body, req.file, res)
})

/**
 * 删除港口点位地图
 * /admin/portpointmap/delete
 */
router.delete("/portpointmap/delete", loginAuth, async (req, res) => {
    await portPointMapController.deletePortPointMap(req.body, res)
})

/**
 * 搜索港口点位地图
 * /admin/portpointmap/search
 */
router.get("/portpointmap/search", loginAuth, async (req, res) => {
    await portPointMapController.searchPortPointMap(req.query, res)
})

/**
 * 批量删除
 * /admin/portpointmap/batch/delete
 */
router.delete("/portpointmap/batch/delete", loginAuth, async (req, res) => {
    await portPointMapController.batchDeletePortPointMap(req.body, res)
})

module.exports = router