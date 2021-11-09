const express = require('express');
const router = express.Router();
const {
  Sequelize,
  DataTypes,
  Model
} = require('sequelize');

// 导入数据库连接方法,实例化Sequelize
const sequemysql = require('../config/db.js')

// 导入暴露的模型
const UserModel = require('../models/UserModel')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

// 添加用户
router.post('/user/add', (req, res) => {
  // 读取请求参数
  const {
    id,
    user_name,
    sex,
    password,
    roles
  } = req.body
  // 根据id查询用户是否存在
  UserModel.findByPk(id).then(user => {
    // 如果用户id存在，返回错误信息,提示用户存在
    if (user) {
      res.send({
        state: 201,
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
      status: 1,
      msg: '添加用户异常, 请重新尝试'
    })
  })
})

// 用户删除，这里得是用户登录了，并且是管理员才可以删除
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
        status: 202,
        msg: '用户不存在.'
      })
    }
  })
})

// 用户登录
router.post('/login', (req, res) => {
  const {
    user_name,
    password
  } = req.body
  // 根据user_name，password查询用户是否存在，如果存在进行登录操作，如果不存在就返回失败信息
  UserModel.findOne({
    where: {
      user_name,
      password
    }
  }).then(user => {
    if (user) {
      // 生成cookie，交给浏览器保存
      res.cookie('cookie_id', user.id, {
        maxAge: 1000 * 60 * 60 * 24
      })
      // 如果用户类型为管理员，就可以登录管理中心
      if (user.roles === 'role_admin') {
        // 发送响应给前端
        res.send({
          state: 200,
          msg: '登录成功.',
          data: user
        })
      } else if (user.roles === 'role_normal') {
        res.send({
          state: 200,
          msg: '登录成功.',
          data: user
        })
      }
    } else {
      // 登录失败
      res.send({
        status: 202,
        msg: '用户名或密码不正确.'
      })
    }
  }).catch(error => {
    console.error('登陆异常.', error)
    res.send({
      status: 1,
      msg: '登陆异常, 请重新尝试.'
    })
  })
})




module.exports = router;