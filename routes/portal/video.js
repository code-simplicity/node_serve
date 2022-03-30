const express = require("express");
const router = express.Router();
const videoController = require("../../controller/portal/video")
const loginAuth = require("../../middleware/loginAuth");

/**
 * 获取所有视频
 */
router.get("/user/video/findAll", loginAuth, async (req, res) => {
    await videoController.videoFindAll(req.query, res)
})

/**
 * 根据内容分类获取相关视频
 */
router.get("/user/video/findOne", loginAuth, async (req, res) => {
    await videoController.videoSearchFindOne(req.query, res)
})

module.exports = router