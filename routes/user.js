const express = require("express");

const router = express.Router();
const {
  Op
} = require("sequelize");

const MD5 = require("md5")

// 导入暴露的模型
const UserModel = require("../models/UserModel");

const jwtUtils = require("../utils/jwtUtils");

const utils = require("../utils/utils");

const R = require("../utils/R")

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express",
  });
});

/**
 * @api {post} /user/add 添加用户
 * @apiDescription 添加用户
 * @apiName 添加用户
 * @apiGroup User
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} user_name="杜培义" 姓名
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} roles="user" 角色
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加用户成功.",
 *      "data": user
 *  }
 * @apiSampleRequest http://localhost:5050/user/add
 * @apiVersion 1.0.0
 */
router.post("/user/add", async (req, res) => {
  // 读取请求参数
  const {
    id,
    password,
    user_name,
    roles,
  } = req.body;
  // 对密码进行加密入库
  const passwordMd5 = MD5(password)
  if (passwordMd5.length !== 32) {
    return res.send(R.fail("请使用md5进行加密"))
  }
  // 根据id查询用户是否存在
  const user = await UserModel.findOne({
    where: {
      id
    },
  })
  // 不存在该用户，添加用户
  if (user === null) {
    const userMd5 = {
      id: id,
      user_name: user_name,
      password: passwordMd5,
      roles: roles
    }
    // 没有密码的返回值
    const userNoMd5 = {
      id: id,
      user_name: user_name,
      roles: roles
    }

    // 保存用户
    UserModel.create({
      ...userMd5,
    })
    return res.send(R.success(userNoMd5, "添加用户成功."))
  } else {
    return res.send(
      R.fail("此用户已经存在.")
    )
  }
});

/**
 * @api {post} /user/delete 删除用户
 * @apiDescription 删除用户
 * @apiName 删除用户
 * @apiGroup User
 * @apiBody {String} id 学号
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "删除用户成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/user/delete
 * @apiVersion 1.0.0
 */
router.post("/user/delete", async (req, res) => {
  const {
    id
  } = req.body;
  const user = await UserModel.destroy({
    where: {
      id
    },
  })
  // 删除成功
  if (user === 0) {
    return res.send(R.success({}, "删除用户成功."))
  } else {
    return res.send(R.fail("用户不存在."))
  }
});

/**
 * @api {post} /user/login 用户登录
 * @apiDescription 用户登录
 * @apiName 用户登录
 * @apiGroup User
 * @apiBody {String} id 学号
 * @apiBody {String} password 密码
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "登录成功.",
 *      "data": data,
 *      "token": token
 *  }
 * @apiSampleRequest http://localhost:5050/user/login
 * @apiVersion 1.0.0
 */
router.post("/user/login", async (req, res) => {
  try {
    const {
      id,
      password
    } = req.body;
    if (!id) {
      return res.send(R.fail("账户不可以为空."))
    }
    if (!password) {
      return res.send(R.fail("密码不可以为空."))
    }
    const {
      dataValues
    } = await UserModel.findOne({
      where: {
        id
      },
    });
    if (dataValues !== null) {
      // 使用md5进行加密
      const passwordMd5 = MD5(password)
      // 比对用户名和密码是否正确
      if (passwordMd5 !== dataValues.password) {
        return res.send(R.fail("密码不正确."))
      }
      if (id !== dataValues.id) {
        return res.send(R.fail("用户名不正确."))
      }
      // 传递id，生成token
      const token = await jwtUtils.setToken(dataValues.id);
      // 生成cookie，将token存在cookie中，并且交给浏览器保存
      res.cookie("node_token", token, {
        maxAge: 10 * 60 * 60 * 24,
      });
      // 响应数据中不要携带password，避免被攻击
      const data = {
        user_name: dataValues.user_name,
        id: dataValues.id,
        roles: dataValues.roles,
        token: token,
      };
      // 如果用户类型为管理员，就可以登录管理中心
      // 发送响应给前端
      return res.send(R.success(data, "登录成功."))
    }
  } catch (error) {
    // 登录失败
    return res.send(R.fail("该用户未注册."))
  }
});

/**
 * @api {get} /user/info 获取用户信息
 * @apiDescription 获取用户信息
 * @apiName 获取用户信息
 * @apiGroup User
 * @apiParam {String} id 管理员账户
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "获取用户信息成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/user/info
 * @apiVersion 1.0.0
 */
router.get("/user/info", async (req, res) => {
  try {
    const {
      id
    } = req.query;
    const {
      dataValues
    } = await UserModel.findOne({
      where: {
        id,
      },
    });
    if (dataValues !== null) {
      const data = {
        user_name: dataValues.user_name,
        id: dataValues.id,
        roles: dataValues.roles,
        score: dataValues.score,
        create_time: dataValues.create_time,
        update_time: dataValues.update_time,
      };
      return res.send(R.success(data, "获取用户信息成功."))
    } else {
      return res.send(R.fail("获取用户信息失败."))
    }
  } catch (error) {
    return res.send(R.fail("获取用户信息失败."))
  }
});

/**
 * @api {get} /user/logout 退出登录
 * @apiDescription 退出登录
 * @apiName 退出登录
 * @apiGroup User
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "退出登录成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/user/logout
 * @apiVersion 1.0.0
 */
router.get("/user/logout", (req, res) => {
  try {
    // 清除cookie中的token，实现退出
    res.clearCookie("node_token");
    return res.send(R.success({}, "退出登录成功."))
  } catch (error) {
    return res.send(R.fail("退出登录失败."))
  }
});

/**
 * @api {get} /user/list 获取所用用户列表
 * @apiDescription 获取所用用户列表
 * @apiName 获取所用用户列表
 * @apiGroup User
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询用户列表成功.",
 *      "data": user
 *  }
 * @apiSampleRequest http://localhost:5050/user/list
 * @apiVersion 1.0.0
 */
router.post("/user/list", async (req, res) => {
  try {
    const {
      pageNum,
      pageSize
    } = req.body;
    const user = await UserModel.findAll({
      order: [
        ["create_time", "DESC"]
      ],
    })
    if (user.length > 0) {
      return res.send(R.success(utils.pageFilter(user, pageNum, pageSize), "查询所有用户列表成功."))
    } else {
      return res.send(R.fail("目前没有用户."))
    }
  } catch (error) {
    return res.send(R.fail("查询所有用户列表失败."))
  }
});

/**
 * @api {get} /user/list/search 搜索用户
 * @apiDescription 搜索用户
 * @apiName 搜索用户
 * @apiGroup User
 * @apiParam  {String} user 用户信息，学号或者姓名 unique
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "查询用户成功.",
 *      "data": user,
 *  }
 * @apiSampleRequest http://localhost:5050/user/list/search
 * @apiVersion 1.0.0
 */
router.get("/user/list/search", async (req, res) => {
  try {
    const {
      user,
      pageNum,
      pageSize
    } = req.query;
    // 通过id或者user_name查询
    const userInfo = await UserModel.findAll({
      where: {
        [Op.or]: [{
            id: {
              [Op.like]: `%${user}%`,
            },
          },
          {
            user_name: {
              [Op.like]: `%${user}%`,
            },
          },
        ],
      },
    })
    if (userInfo.length > 0) {
      return res.send(R.success(utils.pageFilter(userInfo, pageNum, pageSize), "查询用户成功."))
    } else {
      return res.send(R.fail("该用户不存在."))
    }
  } catch (error) {
    return res.send(R.fail("查询用户失败, 请重新尝试."))
  }
});

// TODO:

/**
 * @api {post} /user/update 更新用户信息
 * @apiDescription 更新用户信息
 * @apiName 更新用户信息
 * @apiGroup User
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} user_name="杜培义" 姓名
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} roles="user" 角色
 * @apiBody  {String} state="1" 状态
 * @apiBody  {String} score="0" 得分
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "更新用户信息成功.",
 *      "data": user,
 *  }
 * @apiSampleRequest http://localhost:5050/user/update
 * @apiVersion 1.0.0
 */
router.post("/user/update", (req, res) => {
  const user = req.body;
  UserModel.update(user, {
      where: {
        id: user.id,
      },
    })
    .then((data) => {
      res.send({
        status: 200,
        msg: "更新用户信息成功.",
        data: data,
      });
    })
    .catch((error) => {
      console.error("更新用户信息失败.", error);
      res.send({
        status: 400,
        msg: "更新用户信息失败, 请重新尝试.",
      });
    });
});

/**
 * @api {post} /user/add/score 查询当前用户，并且添加得分
 * @apiDescription 查询当前用户，并且修改得分
 * @apiName 查询当前用户，并且修改得分
 * @apiGroup User
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} score="0" 得分
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "得分添加成功.",
 *      "data": user,
 *  }
 * @apiSampleRequest http://localhost:5050/user/add/score
 * @apiVersion 1.0.0
 */
router.post("/user/add/score", (req, res) => {
  const {
    id,
    score
  } = req.body;
  if (score > 100 || score < 0) {
    return res.send({
      status: 400,
      msg: "得分不能低于0，不能超过100.",
    });
  }
  UserModel.update({
      score: score,
    }, {
      where: {
        id: id,
      },
    })
    .then((user) => {
      if (user) {
        res.send({
          status: 200,
          msg: "当前获得分数：" + score + "分",
          data: score,
        });
      } else {
        res.send({
          status: 400,
          msg: "得分添加失败，视频未看完或者有其他任务未完成！",
        });
      }
    })
    .catch((error) => {
      console.error("得分添加失败.", error);
      res.send({
        status: 400,
        msg: "得分添加失败，请检查重试！",
      });
    });
});

/**
 * @api {post} /user/batch/delete 用户批量删除
 * @apiDescription 用户批量删除
 * @apiName 用户批量删除
 * @apiGroup User
 * @apiBody {Array} userIds 用户的ids
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "视视频删除成功.",
 *  }
 * @apiSampleRequest http://localhost:5050/user/batch/delete
 * @apiVersion 1.0.0
 */
router.post("/user/batch/delete", async (req, res) => {
  const {
    userIds
  } = req.body;
  if (!userIds) {
    return res.send({
      status: 400,
      msg: "userIds不可以为空",
    });
  }
  await UserModel.destroy({
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
    })
    .then((user) => {
      if (user) {
        res.send({
          status: 200,
          msg: "用户批量删除成功.",
        });
      } else {
        res.send({
          status: 400,
          msg: "用户批量删除失败.",
        });
      }
    })
    .catch((err) => {
      console.error("用户批量删除失败.", err);
      res.send({
        status: 400,
        msg: "用户批量删除失败.",
      });
    });
});

module.exports = router;