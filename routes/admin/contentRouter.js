const express = require("express");
const router = express.Router();
const contentController = require("../../controller/admin/contentController")
const loginAuth = require("../../middleware/loginAuth")

/**
 * 添加内容
 * /admin/content/add
 */
router.post("/content/add", loginAuth, async (req, res) => {
    await contentController.addContent(req.body, res)
})

/**
 * 查询所有内容
 * /admin/content/findAll
 */
router.get("/content/findAll", loginAuth, async (req, res) => {
    await contentController.getContentFindAll(req.query, res)
})

/**
 * 修改内容
 * 
 */
router.put("/content/update", loginAuth, async (req, res) => {
    await contentController.updateContent(req.body, res)
})

/**
 * 删除内容
 */
router.delete("/content/delete", loginAuth, async (req, res) => {
    await contentController.deleteContent(req.body, res)
})

/**
 * 根据choose_id查找数据
 * /admin/content/search/choose_id
 */
router.get("/content/search/choose_id", loginAuth, async (req, res) => {
    await contentController.searchContentByChooseId(req.query, res)
})

/**
 * 批量删除
 * /admin/content/batch/delete
 */
router.delete("/content/batch/delete", loginAuth, async (req, res) => {
    await contentController.batchDeleteContent(req.body, res)
});

module.exports = router