const express = require("express");
const router = express.Router();
const path = require("path");
const videoController = require("../../controller/admin/videoController")
const loginAuth = require("../../middleware/loginAuth")
const multer = require("multer");
// 存储路径
const dirPath = path.join("./");
const upload = multer({
    dest: dirPath
});
/**
 * 上传视频
 * /admin/video/upload
 */
router.post("/video/upload", upload.single("video"), loginAuth, async (req, res) => {
    await videoController.uploadVideo(req.body, req.file, res)
})

/**
 * 获取所有视频
 * /admin/video/findAll
 */
router.get("/video/findAll", loginAuth, async (req, res) => {
    await videoController.getVideoFindAll(req.query, res)
})

/**
 * 删除视频
 * /admin/video/delete
 */
router.delete("/video/delete", loginAuth, async (req, res) => {
    await videoController.deleteVideo(req.body, res)
})

/**
 * 修改视频
 * /admin/video/update
 */
router.put("/video/update", upload.single("video"), loginAuth, async (req, res) => {
    await videoController.updateVideo(req.body, req.file, res)
})

/**
 * 批量删除
 * /admin/video/batch/delete
 */
router.delete("/video/batch/delete", loginAuth, async (req, res) => {
    await videoController.batchDeleteVideo(req.body, res)
})

/**
 * 搜索视频
 * /admin/video/search
 */
router.get("/video/search", loginAuth, async (req, res) => {
    await videoController.searchVideo(req.query, res)
})

module.exports = router