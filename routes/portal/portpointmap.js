const express = require("express");
const router = express.Router();
const portPointMapController = require("../../controller/portal/portpointmap")
const loginAuth = require("../../middleware/loginAuth");

/**
 * 获取所有的港口地图
 */
router.post("/user/portpointmap/findOne", loginAuth, async (req, res) => {
    await portPointMapController.portPointMapFindOne(req.body, res)
})

module.exports = router