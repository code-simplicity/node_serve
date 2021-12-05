// 文字内容
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const utils = require("../utils/utils");

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
router.post("/add", (req, res) => {
  const { content } = req.body;
  ContentModel.create({
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
 * @api {post} /content/add/choose_id 添加内容有外键的
 * @apiDescription 添加内容有外键的
 * @apiName 添加内容有外键的
 * @apiGroup Content
 * @apiBody {String} choose_id 选择表id(外键)
 * @apiBody {String} content 内容
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加内容成功.",
 *      "data":  content
 *  }
 * @apiSampleRequest http://localhost:5050/content/add/choose_id
 * @apiVersion 1.0.0
 */
router.post("/add/choose_id", (req, res) => {
  const { choose_id, content } = req.body;
  ContentModel.create({
    content: content,
    choose_id: choose_id,
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
router.get("/delete", (req, res) => {
  const { id } = req.query;
  ContentModel.destroy({
    where: {
      id,
    },
  })
    .then((content) => {
      if (content) {
        res.send({
          status: 200,
          msg: "删除内容成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "删除内容失败，请重试！",
        });
      }
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
router.post("/update", (req, res) => {
  const { id, content } = req.body;
  ContentModel.update(
    {
      content,
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
        data: content,
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
router.get("/search", (req, res) => {
  const { id } = req.query;
  ContentModel.findOne({
    where: {
      id,
    },
  })
    .then((content) => {
      res.send({
        status: 200,
        msg: "查询内容成功.",
        data: content,
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
router.post("/search/choose_id", (req, res) => {
  const { choose_id, pageNum, pageSize } = req.body;
  ContentModel.findAll({
    where: {
      choose_id: choose_id,
    },
  })
    .then((content) => {
      if (content) {
        res.send({
          status: 200,
          msg: "查询内容成功.",
          data: utils.pageFilter(content, pageNum, pageSize),
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
router.post("/findAll", (req, res) => {
  const { pageNum, pageSize, choose_id } = req.body;
  ContentModel.findAll({
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

module.exports = router;
