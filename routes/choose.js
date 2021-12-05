// 选择列表
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const path = require("path");
const fs = require("fs");

const utils = require("../utils/utils");

// 导入暴露的模型
const ChooseModel = require("../models/ChooseModel");

/**
 * @api {post} /choose/add 添加选择数据
 * @apiDescription 添加选择数据
 * @apiName 添加选择数据
 * @apiGroup Choose
 * @apiBody {String} content 内容
 * @apiBody {String} category 分类
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加内容成功.",
 *      "data":  content
 *  }
 * @apiSampleRequest http://localhost:5050/choose/add
 * @apiVersion 1.0.0
 */
router.post("/add", (req, res) => {
  const { content, category } = req.body;
  ChooseModel.create({
    category: category,
    content: content,
  })
    .then((content) => {
      res.send({
        status: 200,
        msg: "添加内容成功.",
        data: content,
      });
    })
    .catch((error) => {
      console.error("添加内容失败.", error);
      res.send({
        status: 400,
        msg: "添加内容失败，请重试！",
      });
    });
});

/**
 * @api {get} /choose/delete 删除选择数据
 * @apiDescription 删除选择数据
 * @apiName 删除选择数据
 * @apiGroup Choose
 * @apiParam {String} id 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "删除内容成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/choose/delete
 * @apiVersion 1.0.0
 */
router.get("/delete", (req, res) => {
  const { id } = req.query;
  ChooseModel.destroy({
    where: {
      id,
    },
  })
    .then((content) => {
      res.send({
        status: 200,
        msg: "删除内容成功.",
      });
    })
    .catch((error) => {
      console.error("删除内容失败.", error);
      res.send({
        status: 400,
        msg: "删除内容失败，请重试！",
      });
    });
});

/**
 * @api {post} /choose/update 修改选择数据
 * @apiDescription 修改选择数据
 * @apiName 修改选择数据
 * @apiGroup Choose
 * @apiBody {String} id 选择数据id
 * @apiBody {String} content 选择数据content
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "修改内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/choose/update
 * @apiVersion 1.0.0
 */
router.post("/update", (req, res) => {
  const { id, content, category } = req.body;
  ChooseModel.update(
    {
      content,
      category,
    },
    {
      where: {
        id,
      },
    }
  )
    .then((content) => {
      res.send({
        status: 200,
        msg: "修改内容成功.",
      });
    })
    .catch((error) => {
      console.error("修改内容失败.", error);
      res.send({
        status: 400,
        msg: "修改内容失败，请重试！",
      });
    });
});

/**
 * @api {get} /choose/search 查询选择数据
 * @apiDescription 查询选择数据
 * @apiName 查询选择数据
 * @apiGroup Choose
 * @apiParam {String} id 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/choose/search
 * @apiVersion 1.0.0
 */
router.get("/search", (req, res) => {
  const { id } = req.query;
  ChooseModel.findOne({
    where: {
      id,
    },
  })
    .then((content) => {
      if (content) {
        res.send({
          status: 200,
          msg: "查询内容成功.",
          data: content,
        });
      } else {
        res.send({
          status: 400,
          msg: "查询内容失败，请重试！",
        });
      }
    })
    .catch((error) => {
      console.error("查询内容失败.", error);
      res.send({
        status: 400,
        msg: "查询内容失败，请重试！",
      });
    });
});

/**
 * @api {post} /choose/findAll 获取所有选择
 * @apiDescription 获取所有选择
 * @apiName 获取所有选择
 * @apiGroup Choose
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/choose/findAll
 * @apiVersion 1.0.0
 */
router.post("/findAll", (req, res) => {
  const { pageNum, pageSize } = req.body;
  ChooseModel.findAll({
    order: [["create_time"]],
  })
    .then((content) => {
      res.send({
        status: 200,
        msg: "查询内容成功.",
        data: utils.pageFilter(content, pageNum, pageSize),
      });
    })
    .catch((error) => {
      console.error("查询内容失败.", error);
      res.send({
        status: 400,
        msg: "查询内容失败，请重试！",
      });
    });
});

/**
 * @api {post} /choose/batch/delete 选择批量删除
 * @apiDescription 选择批量删除
 * @apiName 选择批量删除
 * @apiGroup Choose
 * @apiBody {Array} chooseIds 选择的ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "选择批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/choose/batch/delete
 * @apiVersion 1.0.0
 */
router.post("/batch/delete", async (req, res) => {
  const { chooseIds } = req.body;
  if (!chooseIds) {
    return res.send({
      status: 400,
      msg: "chooseIds不可以为空",
    });
  }
  await ChooseModel.destroy({
    where: {
      id: {
        [Op.in]: chooseIds,
      },
    },
  })
    .then((content) => {
      if (content) {
        res.send({
          status: 200,
          msg: "选择批量删除成功.",
        });
      }
    })
    .catch((err) => {
      console.error("选择批量删除失败.", err);
      res.send({
        status: 400,
        msg: "选择批量删除失败.",
      });
    });
});

module.exports = router;
