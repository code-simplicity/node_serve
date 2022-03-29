const express = require("express");
const router = express.Router();
// 导入暴露的模型
const ContentModel = require("../../models/ContentModel");
const jwtUtils = require("../../utils/jwtUtils");
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const redis = require("../../config/redis")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const model = require("../../server/portal/user")
const contentController = require("../../controller/portal/content")
// token检查
const loginAuth = require("../../middleware/loginAuth");

/**
 * 获取所有内容
 */
router.get("/user/content/findAll", loginAuth, async (req, res) => {
    await contentController.contentFindAll(req.query, res)
})

/**
 * @api {post} /content/search/choose_id 根据选择表id查询对应内容
 * @apiVersion 1.0.0
 */
router.post("/user/content/choose_id", loginAuth, async (req, res) => {
    await contentController.contentByChooseId(req.body, res)
});

module.exports = router