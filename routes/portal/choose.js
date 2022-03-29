const express = require("express");
const router = express.Router();
// 导入暴露的模型
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const chooseController = require("../../controller/portal/choose")
// token检查
const loginAuth = require("../../middleware/loginAuth");

/**
 * 获取所有内容
 */
router.get("/user/choose/findAll", loginAuth, async (req, res) => {
    await chooseController.chooseFindAll(req.query, res)
})

module.exports = router