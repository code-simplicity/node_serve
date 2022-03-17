// 处理excel导入,导出
const express = require("express");

const fs = require("fs");

const xlsx = require("node-xlsx");

const multer = require("multer");

const {
  Op
} = require("sequelize");

const MD5 = require("md5")

const router = express.Router();

const R = require("../utils/R")

// 处理excel文件
const upload = multer({
  dest: "../public/upload",
});

// 定义全局数组
const excelHead = ["id", "user_name", "password", "roles", "state", "score"];

// 导入暴露的模型
const UserModel = require("../models/UserModel");

const excelUtils = require("../utils/excelUtils");

/**
 * 1. 点击下载excel模板，生成blob流给前端
 * 2. excel模板输入信息后导入，解析数据(先存到服务器，服务器改名后node-xlsx读取，添加到数据库)存入数据库，存入成功给前端状态，前端重新调用init
 * 3. 前端批量导出，传递过来ids，我们利用ids查询，然后生成数据，blob流返回给前端
 */
/**
 * @api {get} /excel/export excel模板生成
 * @apiDescription excel模板生成
 * @apiName excel模板生成
 * @apiGroup Excel
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "模板生成成功.",
 *      "data":  xlsx.build(excelData, optionArr)
 *  }
 * @apiSampleRequest http://localhost:5050/excel/export
 * @apiVersion 1.0.0
 */
router.get("/export", (req, res) => {
  const excelData = [{
    name: "用户模板.xlsx", // 给第一个sheet指名字
    data: [
      ["学号", "姓名", "密码", "角色", "状态", "得分"]
    ],
  }, ];
  const optionArr = {
    "!cols": [{
        wch: 10,
      },
      {
        wch: 10,
      },
      {
        wch: 10,
      },
      {
        wch: 10,
      },
      {
        wch: 10,
      },
      {
        wch: 10,
      },
    ],
  };
  // 返回模板信息
  return res.send(xlsx.build(excelData, optionArr));
});

/**
 * @api {post} /excel/upload excel导入数据到用户表
 * @apiDescription excel导入数据到用户表
 * @apiName excel导入数据到用户表
 * @apiGroup Excel
 * @apiBody {File} file excel文件
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "成功导入excel到数据库.",
 *  }
 * @apiSampleRequest http://localhost:5050/excel/upload
 * @apiVersion 1.0.0
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 重命名文件夹
    await fs.rename(
      // 上传文件路径，这里可以修改，后期上线改为服务器的路径
      req.file.path,
      req.file.destination + "/" + "用户模板.xlsx",
      (err) => {
        if (err) {
          return res.send(R.fail("失败."))
        } else {
          // 解析模板,返回对象形式的键值对
          const excelObj = xlsx.parse("../public/upload/用户模板.xlsx");
          const dataArr = excelObj[0].data;
          // 添加的数据
          const addData = {};
          // 判断是不是使用的指定模板导入的
          if (excelObj[0].data[0].toString() === "学号,姓名,密码,角色,状态,得分") {
            // 删除二位数组第一项，也就是表头数据
            dataArr.shift();
            // 遍历
            dataArr.map(async (item) => {
              excelHead.map((key, index) => {
                // 先对password进行一个加密，再添加到数组中，如果这个key为password，那么对该值进行加密
                addData[key] = key === "password" ? MD5(item[index]) : item[index];
              });
              // 使用模板插入数据
              await UserModel.bulkCreate([addData]);
            });
            return res.send(R.success(addData, "成功导入excel到数据库."));
          } else {
            // 不是的话,返回给前端错误状态
            return res.send(R.fail("模板匹配错误，请检查关键字."));
          }
        }
      }
    );
  } catch (error) {
    return res.send(R.fail("导入异常, 请重新尝试."));
  }
});

/**
 * @api {post} /excel/export/user 表格数据导出
 * @apiDescription 表格数据导出
 * @apiName 表格数据导出
 * @apiGroup Excel
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "用户导出成功".",
 *      "data":  xlsx.build(excelData, optionArr)
 *  }
 * @apiSampleRequest http://localhost:5050/excel/export/user
 * @apiVersion 1.0.0
 */
router.post("/export/user", async (req, res) => {
  // 数组，每个值直接用逗号隔开
  const {
    exportIds
  } = req.body;
  const user = await UserModel.findAll({
    where: {
      id: {
        [Op.in]: exportIds,
      },
    },
  });
  console.log("user", user)
  if (user.length > 0) {
    const exportData = JSON.parse(JSON.stringify(user));
    console.log("exportData", exportData)
    const excelData = [{
      name: "用户模板.xlsx",
      data: [
        [
          "学号",
          "姓名",
          "密码",
          "角色",
          "状态",
          "得分",
          "创建时间",
          "更新时间",
        ],
      ],
    }, ];
    const optionArr = {
      "!cols": [{
          wch: 10,
        },
        {
          wch: 10,
        },
        {
          wch: 10,
        },
        {
          wch: 10,
        },
        {
          wch: 10,
        },
        {
          wch: 10,
        },
        {
          wch: 20,
        },
        {
          wch: 20,
        },
      ],
    };
    exportData.map((item) => {
      const exportArr = [];
      for (const key in item) {
        exportArr.push(item[key]);
      }
      //  装载数据
      excelData[0].data.push(exportArr);
    });
    return res.send(xlsx.build(excelData, optionArr));
  } else {
    return res.send(R.fail("用户数据导出失败，请勾选对应的表格数据."));
  }
});

module.exports = router;