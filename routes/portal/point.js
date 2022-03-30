const express = require("express");
const router = express.Router();
const pointController = require("../../controller/portal/point")
const loginAuth = require("../../middleware/loginAuth");

/**
 * @api {post} /point/search 查询port_point_map_id下的点位图
 * @apiVersion 1.0.0
 */
router.post("/user/point/by-pointmapid/findAll", loginAuth, async (req, res) => {
    await pointController.getPointByPointMapIdFindAll(req.body, res)
});

module.exports = router