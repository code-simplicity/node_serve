// 点位表
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

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
router.post("/add", (req, res) => {
  const { port_point_map_id, content } = req.body;
  PointModel.create({
    content: content,
    port_point_map_id: port_point_map_id,
  })
    .then((point) => {
      res.send({
        status: 200,
        msg: "添加点位成功.",
        data: point,
      });
    })
    .catch((error) => {
      console.error("添加点位失败.", error);
      res.send({
        status: 400,
        msg: "添加点位失败，请重试！",
      });
    });
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
router.get("/delete", (req, res) => {
  const { id } = req.query;
  PointModel.destroy({
    where: {
      id: id,
    },
  })
    .then((point) => {
      res.send({
        status: 200,
        msg: "删除点位成功.",
      });
    })
    .catch((error) => {
      console.error("删除点位失败.", error);
      res.send({
        status: 400,
        msg: "删除点位失败，请重试！",
      });
    });
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
router.post("/update", (req, res) => {
  const point = req.body;
  PointModel.update(point, {
    where: {
      id: point.id,
    },
  })
    .then((point) => {
      res.send({
        status: 200,
        msg: "修改点位成功.",
      });
    })
    .catch((error) => {
      console.error("修改点位失败.", error);
      res.send({
        status: 400,
        msg: "修改点位失败，请重试！",
      });
    });
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
router.post("/search", (req, res) => {
  const { pageNum, pageSize, port_point_map_id, content } = req.body;
  PointModel.findAll({
    where: {
      [Op.or]: [
        {
          port_point_map_id: port_point_map_id ? port_point_map_id : "",
        },
        {
          content: content ? content : "",
        },
      ],
    },
    order: [["create_time"]],
  })
    .then((point) => {
      res.send({
        status: 200,
        msg: "查询点位成功.",
        data: utils.pageFilter(point, pageNum, pageSize),
      });
    })
    .catch((error) => {
      console.error("查询点位失败.", error);
      res.send({
        status: 400,
        msg: "查询点位失败，请重试！",
      });
    });
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
router.post("/findAll", (req, res) => {
  const { pageNum, pageSize } = req.body;
  PointModel.findAll({
    order: [["create_time", "DESC"]],
  })
    .then((point) => {
      res.send({
        status: 200,
        msg: "获取所有点位图成功.",
        data: utils.pageFilter(point, pageNum, pageSize),
      });
    })
    .catch((err) => {
      console.error("获取所有点位图失败.", err);
      res.send({
        status: 400,
        msg: "获取所有点位图失败.",
      });
    });
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
  const { pointIds } = req.body;
  if (!pointIds) {
    return res.send({
      status: 400,
      msg: "pointIds不可以为空",
    });
  }
  await PointModel.destroy({
    where: {
      id: {
        [Op.in]: pointIds,
      },
    },
  })
    .then((point) => {
      if (point) {
        res.send({
          status: 200,
          msg: "点位图批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "点位图批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("点位图批量删除失败.", err);
      res.send({
        status: 400,
        msg: "点位图批量删除失败.",
      });
    });
});

module.exports = router;
