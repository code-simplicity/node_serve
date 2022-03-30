const express = require("express");
const router = express.Router();
const waveformsController = require("../../controller/portal/waveforms")
const loginAuth = require("../../middleware/loginAuth");


/**
 * @api {get} /waveforms/search/point_id  根据点位图id查询波形图
 * @apiSampleRequest http://localhost:5050/waveforms/search/point_id
 * @apiVersion 1.0.0
 */
router.post("/user/waveforms/point_id/findOne", async (req, res) => {
    await waveformsController.waveFormsByPointIdFindOne(req.body, res)

});

module.exports = router