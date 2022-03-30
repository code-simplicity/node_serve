const express = require("express");
const router = express.Router();
const wavestatsController = require("../../controller/portal/wavestats")
const loginAuth = require("../../middleware/loginAuth");


/**
 * @api {get} /waveforms/search/point_id  根据点位图id查询波形图
 * @apiSampleRequest http://localhost:5050/waveforms/search/point_id
 * @apiVersion 1.0.0
 */
router.post("/user/wavestats/point_id/findOne", loginAuth, async (req, res) => {
    await wavestatsController.wavestatsByPointIdFindOne(req.body, res)

});

module.exports = router