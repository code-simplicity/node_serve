const express = require('express');
const router = express.Router();
const {
  Op
} = require("sequelize");

const path = require('path')
const fs = require('fs')

// 导入暴露的模型
const UserModel = require('../models/UserModel')

const jwtUtils = require('../utils/jwtUtils')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
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
router.post('/user/add', (req, res) => {
  // 读取请求参数
  const {
    id,
    user_name,
    password,
    roles
  } = req.body
  // 根据id查询用户是否存在
  UserModel.findOne({
    where: {
      id
    }
  }).then(user => {
    // 如果用户id存在，返回错误信息,提示用户存在
    if (user) {
      res.send({
        status: 400,
        msg: '此用户已经存在.'
      })
      console.info('用户信息', user)
    } else {
      // 保存用户
      return UserModel.create({
        ...req.body
      })
    }
  }).then(user => {
    res.send({
      status: 200,
      msg: "添加用户成功.",
      data: user
    })
  }).catch(error => {
    console.error('注册异常', error)
    res.send({
      status: 400,
      msg: '添加用户异常, 请重新尝试'
    })
  })
})

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
router.post('/user/delete', (req, res) => {
  const {
    id
  } = req.body
  UserModel.destroy({
    where: {
      id
    }
  }).then(user => {
    if (user) {
      res.send({
        status: 200,
        msg: '删除用户成功.'
      })
    } else {
      res.send({
        status: 400,
        msg: '用户不存在.'
      })
    }
  })
})

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
router.post('/user/login', async (req, res, next) => {
  try {
    const {
      id,
      password
    } = req.body
    const user = await UserModel.findOne({
      where: {
        id,
        password
      }
    })
    if (user) {
      // 传递id，生成token
      const token = await jwtUtils.setToken(user.id, )
      // 生成cookie，将token存在cookie中，并且交给浏览器保存
      res.cookie('token', token, {
        maxAge: 10 * 60 * 60 * 24
      })
      // 响应数据中不要携带password，避免被攻击
      const data = {
        user_name,
        id: user.id,
      }
      // 如果用户类型为管理员，就可以登录管理中心
      if (user.roles === 'admin') {
        // 发送响应给前端
        res.send({
          status: 200,
          msg: '登录成功.',
          data: data,
          token: token
        })
      } else if (user.roles === 'user') {
        res.send({
          status: 200,
          msg: '登录成功.',
          data: data,
          token: token
        })
      }
    } else {
      // 登录失败
      res.send({
        status: 400,
        msg: '用户名或密码不正确.'
      })
    }
  } catch (error) {
    console.error('登陆异常.', error)
    res.send({
      status: 400,
      msg: '登陆异常, 请重新尝试.'
    })
    next(error);
  }
})

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
router.get('/user/logout', (req, res) => {
  try {
    // 清除cookie中的token，实现退出
    res.clearCookie('token')
    res.send({
      status: 200,
      msg: '退出登录成功.'
    })
  } catch (error) {
    console.error('退出异常.', error)
    res.send({
      status: 400,
      msg: '退出异常, 请重新尝试.'
    })
    next(error);
  }
})

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
router.get('/user/list', (req, res) => {
  UserModel.findAll().then(user => {
    res.send({
      status: 200,
      msg: '查询所有用户列表成功.',
      data: user
    })
  }).catch(error => {
    console.error('获取用户列表异常.', error)
    res.send({
      status: 400,
      msg: '获取用户列表异常, 请重新尝试.',
    })
  })
})

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
router.get('/user/list/search', (req, res) => {
  const {
    user
  } = req.query
  // 通过id或者user_name查询
  UserModel.findAll({
    where: {
      [Op.or]: [{
          id: {
            [Op.like]: `%${user}%`
          }
        },
        {
          user_name: {
            [Op.like]: `%${user}%`
          }
        }
      ]
    }
  }).then(user => {
    if (user) {
      res.send({
        status: 200,
        msg: '查询用户成功.',
        data: user
      })
    }
  }).catch(error => {
    console.error('查询用户失败.', error)
    res.send({
      status: 400,
      msg: '查询用户失败, 请重新尝试.',
    })
  })
})

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
router.post('/user/update', (req, res) => {
  const user = req.body
  UserModel.update(user, {
    where: {
      id: user.id
    }
  }).then(data => {
    res.send({
      status: 200,
      msg: '更新用户信息成功.',
      data: data
    })
  }).catch(error => {
    console.error('更新用户信息失败.', error)
    res.send({
      status: 400,
      msg: '更新用户信息失败, 请重新尝试.',
    })
  })
})

// 查询当前用户，并且修改得分
router.post('/user/update/score', (req, res) => {
  const {
    id,
    score
  } = req.body
  UserModel.update({
    score: score
  }, {
    where: {
      id: id
    }
  }).then(user => {
    res.send({
      status: 200,
      msg: '得分添加成功.',
      data: user
    })
  }).catch(error => {
    console.error('得分添加失败.', error)
    res.send({
      status: 200,
      msg: '得分添加失败，请检查重试！',
      data: user
    })
  })
})

module.exports = router;