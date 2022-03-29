const express = require("express");
const router = express.Router();
const videoController = require("../../controller/portal/video")
const loginAuth = require("../../middleware/loginAuth");

router.get("/user/video/findAll", loginAuth, async (req, res) => {
    await videoController.videoFindAll(req.query, res)
})

module.exports = router