const express = require("express");
const router = express.Router();
const waveDataExcelController = require("../../controller/portal/waveDataExcelController")
const loginAuth = require("../../middleware/loginAuth");

/**
 * 门户获取港口点位分析excel的信息
 * /portal/user/portal/wavedataexcel/finOne/byportmappointid
 */
router.get('/user/wavedataexcel/finOne/byportmapid', loginAuth, async (req, res) => {
    await waveDataExcelController.getWaveDataExcelByPortMapPointId(req.query, res)
})

module.exports = router