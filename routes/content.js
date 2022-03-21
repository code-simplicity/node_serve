// 文字内容
const express = require("express");
const router = express.Router();
const {
  Op
} = require("sequelize");

const utils = require("../utils/utils");

const R = require("../utils/R")

// 导入暴露的模型
const ContentModel = require("../models/ContentModel");

/**
 * @api {post} /content/add 添加内容
 * @apiDescription 添加内容
 * @apiName 添加内容
 * @apiGroup Content
 * @apiBody {String} content 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加内容成功.",
 *      "data":  content
 *  }
 * @apiSampleRequest http://localhost:5050/content/add
 * @apiVersion 1.0.0
 */
router.post("/add", async (req, res) => {
  try {
    const {
      content,
      choose_id
    } = req.body;
    if (!content) {
      return res.send(R.fail("请输入内容."))
    }
    const {
      dataValues
    } = await ContentModel.create({
      choose_id,
      content,
    })
    console.log(dataValues)
    if (dataValues !== null) {
      return res.send(R.success(dataValues, "内容添加成功."))
    } else {
      return res.send(R.fail("内容添加失败."))
    }
  } catch (error) {
    return res.send(R.fail("内容添加失败."))
  }
});

/**
 * @api {get} /content/delete 删除内容
 * @apiDescription 删除内容
 * @apiName 删除内容
 * @apiGroup Content
 * @apiParam {String} id 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "删除内容成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/content/delete
 * @apiVersion 1.0.0
 */
router.get("/delete", async (req, res) => {
  const {
    id
  } = req.query;
  if (!id) {
    return res.send(R.fail("id不可以为空."))
  }
  const content = await ContentModel.destroy({
    where: {
      id,
    },
  })
  if (content) {
    return res.send(R.success({}, "删除内容成功."))
  } else {
    return res.send(R.fail("删除内容失败."))
  }
});

/**
 * @api {post} /content/update 修改内容
 * @apiDescription 修改内容
 * @apiName 修改内容
 * @apiGroup Content
 * @apiBody {String} id 选择数据id
 * @apiBody {String} content 选择数据content
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "修改内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/content/update
 * @apiVersion 1.0.0
 */
router.post("/update", async (req, res) => {
  try {
    const {
      id,
      content
    } = req.body;
    if (!id) {
      return res.send(R.fail("id不可以为空."))
    }
    if (!content) {
      return res.send(R.fail("内容不可以为空."))
    }
    const [data] = await ContentModel.update({
      content,
    }, {
      where: {
        id,
      },
    })
    if (data) {
      return res.send(R.success({
        id,
        content
      }, "内容更新成功."))
    } else {
      return res.send(R.fail("并未作出内容的修改."))
    }
  } catch (error) {
    return res.send(R.fail("内容更新失败."))
  }
});

/**
 * @api {get} /content/search 查询内容
 * @apiDescription 查询内容
 * @apiName 查询内容
 * @apiGroup Content
 * @apiParam {String} id 内容id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/content/search
 * @apiVersion 1.0.0
 */
router.get("/search", async (req, res) => {
  try {
    const {
      id
    } = req.query;
    if (!id) {
      return res.send(R.fail("id不可以为空."))
    }
    const {
      dataValues
    } = await ContentModel.findOne({
      where: {
        id,
      },
    })
    if (dataValues !== null) {
      return res.send(R.success(dataValues, "获取内容成功."))
    } else {
      return res.send(R.fail("获取内容失败."))
    }
  } catch (error) {
    return res.send(R.fail("获取内容失败."))
  }
});

/**
 * @api {post} /content/search/choose_id 根据选择表id查询对应内容
 * @apiDescription 根据选择表id查询对应内容
 * @apiName 根据选择表id查询对应内容
 * @apiGroup Content
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 每页数量
 * @apiBody {String} choose_id choose_id选择表id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/content/search/choose_id
 * @apiVersion 1.0.0
 */
router.post("/search/choose_id", async (req, res) => {
  try {
    const {
      choose_id,
      pageNum,
      pageSize
    } = req.body;
    const content = await ContentModel.findAll({
      where: {
        choose_id,
      },
    })
    if (content.length > 0) {
      return res.send(R.success(utils.pageFilter(content, pageNum, pageSize), "查询内容成功."))
    } else {
      return res.send(R.fail("查询内容失败."))
    }
  } catch (error) {
    return res.send(R.fail("查询内容失败."))
  }
});

/**
 * @api {post} /content/findAll 获取所有内容
 * @apiDescription 获取所有内容
 * @apiName 获取所有内容
 * @apiGroup Content
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询内容成功.",
 *      "data": content
 *  }
 * @apiSampleRequest http://localhost:5050/content/findAll
 * @apiVersion 1.0.0
 */
router.post("/findAll", async (req, res) => {
  const {
    pageNum,
    pageSize
  } = req.body;
  const content = await ContentModel.findAll({
    order: [
      ["create_time"]
    ],
  })
  if (content.length > 0) {
    return res.send(R.success(utils.pageFilter(content, pageNum, pageSize), "查询内容成功."))
  } else {
    return res.send(R.fail("查询内容成功."))
  }
});

/**
 * @api {post} /content/batch/delete 内容批量删除
 * @apiDescription 内容批量删除
 * @apiName 内容批量删除
 * @apiGroup Content
 * @apiBody {Array} contentIds 内容ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "内容批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/content/batch/delete
 * @apiVersion 1.0.0
 */
router.post("/batch/delete", async (req, res) => {
  const {
    contentIds
  } = req.body;
  if (contentIds.length <= 0) {
    return res.send(R.fail("contentIds不可以为空."))
  }
  const content = await ContentModel.destroy({
    where: {
      id: {
        [Op.in]: contentIds,
      },
    },
  })
  if (content) {
    return res.send(R.success({}, "内容批量删除成功."))
  } else {
    return res.send(R.fail("内容批量删除失败."))
  }
});
module.exports = router;