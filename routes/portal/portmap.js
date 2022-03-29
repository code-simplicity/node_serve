const express = require("express");
const router = express.Router();
const portMapController = require("../../controller/portal/portmap")
const loginAuth = require("../../middleware/loginAuth");

router.get("/user/portmap/findAll", loginAuth, async (req, res) => {
    await portMapController.portMapFindAll(req.query, res)
})

module.exports = router