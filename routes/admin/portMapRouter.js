const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const loginAuth = require("../../middleware/loginAuth")
const portMapController = require("../../controller/admin/portMapController")
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
});

/**
 * 上传港口地图
 * /admin/portmap/upload
 */
router.post("/portmap/upload", upload.single("image"), loginAuth, async (req, res) => {
    await portMapController.uploadPortMap(req.file, res)
})

/**
 * 获取港口地图
 * /admin/portmap/findAll
 */
router.get("/portmap/findAll", loginAuth, async (req, res) => {
    await portMapController.portMapFindAll(req.query, res)
})

/**
 * 删除港口地图
 * /admin/portmap/delete
 */
router.delete("/portmap/delete", loginAuth, async (req, res) => {
    await portMapController.portMapDelete(req.body, res)
})

/**
 * 修改港口地图
 * /admin/portmap/update
 */
router.put("/portmap/update", upload.single("image"), loginAuth, async (req, res) => {
    await portMapController.updatePortMap(req.body, req.file, res)
})

module.exports = router