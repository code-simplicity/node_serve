const express = require("express");
const router = express.Router();
const bimController = require("../../controller/portal/bimController")
const loginAuth = require("../../middleware/loginAuth");

/**
 * 门户获取港bim
 * /portal/user/bim/finAll
 */
router.get('/user/bim/finAll', loginAuth, async (req, res) => {
    await bimController.getBimFindAll(req.query, res)
})

module.exports = router