// 选择列表
const express = require("express");
const router = express.Router();
const {
  Op
} = require("sequelize");

const R = require("../utils/R")

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
router.post("/add", async (req, res) => {
  try {
    const {
      content,
      category
    } = req.body;
    if (!content) {
      return res.send(R.fail("内容不能为空."))
    }
    if (!category) {
      return res.send(R.fail("分类不能为空."))
    }
    const {
      dataValues
    } = await ChooseModel.create({
      category,
      content,
    })
    if (dataValues !== null) {
      return res.send(R.success({
        content,
        category
      }, "添加内容成功."))
    } else {
      return res.send(R.fail("添加内容失败."))
    }
  } catch (error) {
    return res.send(R.fail("添加内容失败."))
  }

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
router.get("/delete", async (req, res) => {
  const {
    id
  } = req.query;
  if (!id) {
    return res.send(R.fail("选择的id不可以为空."))
  }
  const choose = await ChooseModel.destroy({
    where: {
      id,
    },
  })
  // 返回值是1证明删除成功
  if (choose) {
    return res.send(R.success({}, "删除内容成功."))
  } else {
    return res.send(R.fail("删除内容失败."))
  }
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
router.post("/update", async (req, res) => {
  try {
    const result = req.body;
    if (!result.id) {
      return res.send(R.fail("id不可以为空."))
    }
    if (!result.content) {
      return res.send(R.fail("内容不可以为空."))
    }
    if (!result.category) {
      return res.send(R.fail("分类不可以为空."))
    }
    // 解构
    const [choose] = await ChooseModel.update(result, {
      where: {
        id: result.id
      },
    })
    if (choose) {
      return res.send(R.success(result, "修改内容成功"))
    } else {
      return res.send(R.fail("修改内容失败,并未作出修改."))
    }
  } catch (error) {
    return res.send(R.fail("修改内容失败."))
  }
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
router.get("/search", async (req, res) => {
  try {
    const {
      id
    } = req.query;
    if (!id) {
      return res.send(R.fail("请输入id."))
    }
    const {
      dataValues
    } = await ChooseModel.findOne({
      where: {
        id,
      },
    })
    if (dataValues !== null) {
      return res.send(R.success(dataValues, "查询内容成功."))
    } else {
      return res.send(R.fail("查询内容失败，请重试！"))
    }
  } catch (error) {
    return res.send(R.fail("查询内容失败，不存在该内容."))
  }
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
router.post("/findAll", async (req, res) => {
  try {
    const {
      pageNum,
      pageSize
    } = req.body;
    const choose = await ChooseModel.findAll({
      order: [
        ["create_time"]
      ],
    })
    if (choose.length > 0) {
      return res.send(R.success(utils.pageFilter(choose, pageNum, pageSize), "查询内容成功."))
    } else {
      return res.send(R.success(utils.pageFilter(choose, pageNum, pageSize), "目前没有内容."))
    }
  } catch (error) {
    return res.send(R.fail("查询内容失败."))
  }
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
  const {
    chooseIds
  } = req.body;
  if (chooseIds.length <= 0) {
    return res.send(R.fail("chooseIds不可以为空."))
  }
  const choose = await ChooseModel.destroy({
    where: {
      id: {
        [Op.in]: chooseIds,
      },
    },
  })
  if (choose) {
    return res.send(R.success({}, "选择批量删除成功."))
  } else {
    return res.send(R.fail("选择批量删除失败."))
  }
});

module.exports = router;