const express = require("express");
const router = express.Router();
const userController = require("../../controller/admin/userController")

/**
 * /admin/user/login
 */
router.post("/user/login", async (req, res) => {
    await userController.login(req.body, req, res)
})

module.exports = router