// 点位表
const express = require("express");
const {
  Op
} = require("sequelize");

const R = require("../utils/R")

const router = express.Router();

const utils = require("../utils/utils");

// 导入暴露的模型
const PointModel = require("../models/PointModel");

/**
 * @api {post} /point/add 添加点位表内容
 * @apiDescription 添加点位表内容
 * @apiName 添加点位表内容
 * @apiGroup Point
 * @apiBody {String} port_point_map_id 港口点位图id
 * @apiBody {String} content 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/add
 * @apiVersion 1.0.0
 */
router.post("/add", async (req, res) => {
  try {
    const {
      port_point_map_id,
      content
    } = req.body;
    if (!port_point_map_id) {
      return res.send(R.fail("港口点位图id不可以为空."))
    }
    if (!content) {
      return res.send(R.fail("点位内容不可以为空."))
    }
    const {
      dataValues
    } = await PointModel.create({
      content,
      port_point_map_id,
    })
    if (dataValues !== null) {
      return res.send(R.success(dataValues, "点位添加成功."))
    } else {
      return res.send(R.fail("点位添加失败."))
    }
  } catch (error) {
    return res.send(R.fail("点位添加失败."))
  }
});

/**
 * @api {post} /point/delete 删除点位表
 * @apiDescription 删除点位表
 * @apiName 删除点位表
 * @apiGroup Point
 * @apiParam {String} id 点位图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/delete
 * @apiVersion 1.0.0
 */
router.get("/delete", async (req, res) => {
  const {
    id
  } = req.query;
  if (!id) {
    return res.send(R.fail("id不可以为空."))
  }
  const point = await PointModel.destroy({
    where: {
      id: id,
    },
  })
  if (point) {
    return res.send(R.success(point, "点位添加成功."))
  } else {
    return res.send(R.fail("删除点位失败."))
  }
});

/**
 * @api {post} /point/update 修改点位表
 * @apiDescription 修改点位表
 * @apiName 修改点位表
 * @apiGroup Point
 * @apiBody {String} id 点位图id
 * @apiBody {String} port_point_map_id 港口点位图id
 * @apiBody {String} content 点位图内容
 * @apiBody {String} state 状态
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "修改点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/update
 * @apiVersion 1.0.0
 */
router.post("/update", async (req, res) => {
  try {
    const point = req.body;
    const [result] = await PointModel.update(point, {
      where: {
        id: point.id,
      },
    })
    if (result) {
      return res.send(R.success(point, "点位修改成功."))
    } else {
      return res.send(R.fail("点位修改失败."))
    }
  } catch (error) {
    return res.send(R.fail("点位修改失败."))
  }
});

/**
 * @api {post} /point/search 查询port_point_map_id下的点位图
 * @apiDescription 查询port_point_map_id下的点位图
 * @apiName 查询port_point_map_id下的点位图
 * @apiGroup Point
 * @apiBody {String} port_point_map_id 港口点位图id
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加点位成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/search
 * @apiVersion 1.0.0
 */
router.post("/search", async (req, res) => {
  try {
    const {
      pageNum,
      pageSize,
      port_point_map_id,
      content
    } = req.body;
    const point = await PointModel.findAll({
      where: {
        [Op.or]: [{
            port_point_map_id: port_point_map_id ? port_point_map_id : "",
          },
          {
            content: content ? content : "",
          },
        ],
      },
      order: [
        ["create_time"]
      ],
    })
    if (point.length > 0) {
      return res.send(R.success(utils.pageFilter(point, pageNum, pageSize), "查询点位成功."))
    } else {
      return res.send(R.fail("查询点位失败."))
    }
  } catch (error) {
    return res.send(R.fail("查询点位失败."))
  }
});

/**
 * @api {post} /point/findAll 获取所有点位
 * @apiDescription 获取所有点位
 * @apiName 获取所有点位
 * @apiGroup Point
 * @apiBody {String} pageNum 页码
 * @apiBody {String} pageSize 每页数量
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "获取所有点位图成功.",
 *      "data": img
 *  }
 * @apiSampleRequest http://localhost:5050/point/findAll
 * @apiVersion 1.0.0
 */
router.post("/findAll", async (req, res) => {
  const {
    pageNum,
    pageSize
  } = req.body;
  const point = await PointModel.findAll({
    order: [
      ["create_time"]
    ],
  })
  if (point.length > 0) {
    return res.send(R.success(utils.pageFilter(point, pageNum, pageSize), "获取所有点位成功."))
  } else {
    return res.send(R.fail("获取所有点位失败."))
  }
});

/**
 * @api {post} /point/batch/delete 点位图批量删除
 * @apiDescription 点位图批量删除
 * @apiName 点位图批量删除
 * @apiGroup Point
 * @apiBody {Array} pointIds 点位ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "点位图批量删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/point/batch/delete
 * @apiVersion 1.0.0
 */
router.post("/batch/delete", async (req, res) => {
  const {
    pointIds
  } = req.body;
  if (pointIds.length <= 0) {
    return res.send(R.fail("pointIds不可以为空."))
  }
  const point = await PointModel.destroy({
    where: {
      id: {
        [Op.in]: pointIds,
      },
    },
  })
  if (point) {
    return res.send(R.success(point, "批量删除点位成功."))
  } else {
    return res.send(R.fail("点位图批量删除失败."))
  }
});

module.exports = router;