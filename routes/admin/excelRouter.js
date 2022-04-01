const express = require("express");
const router = express.Router();
const multer = require("multer");
const excelController = require("../../controller/admin/excelController")
const loginAuth = require("../../middleware/loginAuth");
// 处理excel文件
const upload = multer({
    dest: "../public/upload",
});
/**
 * 1. 点击下载excel模板，生成blob流给前端
 * 2. excel模板输入信息后导入，解析数据(先存到服务器，服务器改名后node-xlsx读取，添加到数据库)存入数据库，存入成功给前端状态，前端重新调用init
 * 3. 前端批量导出，传递过来ids，我们利用ids查询，然后生成数据，blob流返回给前端
 */
/**
 * @api {get} /user/excel/export excel模板生成
 * @apiSampleRequest http://localhost:5050/admin/user/excel/export
 */
router.get("/user/excel/export", loginAuth, async (req, res) => {
    await excelController.exportExcel(res)
})

/**
 * @api {post} /excel/upload excel导入数据到用户表
 * @apiSampleRequest http://localhost:5050/admin/user/excel/upload
 * @apiVersion 1.0.0
 */
router.post("/user/excel/upload", upload.single("file"), loginAuth, async (req, res) => {
    await excelController.excelUploadUser(req, res)
});

/**
 * @api {post} /admin/user/excel/download 表格数据导出
 * @apiSampleRequest http://localhost:5050/admin/user/excel/download
 * @apiVersion 1.0.0
 */
router.post("/user/excel/download", loginAuth, async (req, res) => {
    await excelController.excelUserDownload(req.body, res)
});

module.exports = router