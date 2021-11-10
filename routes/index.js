const express = require('express');
const router = express.Router();

const path = require('path')
const fs = require('fs')

const multer = require('multer')

const dirPath = path.join(__dirname, '..', 'public/excel')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, function (err) {
        if (err) {
          console.log(`err`, err)
        } else {
          cb(null, dirPath)
        }
      })
    } else {
      cb(null, dirPath)
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + Date.now() + ext)
  }
})

const upload = multer({
  storage
})

const uploadFile = upload.single('file')

// 导入暴露的模型
const UserModel = require('../models/UserModel')

const jwtUtils = require('../utils/jwtUtils')

const excelUtils = require('../utils/excelUtils')

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
 * @apiBody  {String} id 学号
 * @apiBody  {String} user_name 姓名
 * @apiBody  {String} sex 性别
 * @apiBody  {String} password 密码
 * @apiBody  {String} roles 角色
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "添加用户成功.",
 *      "data": user
 *  }
 * @apiSampleRequest http://localhost:5000/user/add
 * @apiVersion 1.0.0
 */
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
  UserModel.findOne({
    where: {
      id
    }
  }).then(user => {
    // 如果用户id存在，返回错误信息,提示用户存在
    if (user) {
      res.send({
        status: 201,
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
      status: 201,
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
 * @apiSampleRequest http://localhost:5000/user/delete
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
        status: 201,
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
 * @apiBody {String} user_name 姓名
 * @apiBody {String} password 密码
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "status" : "200",
 *      "msg": "登录成功.",
 *      "data": data,
 *      "token": token
 *  }
 * @apiSampleRequest http://localhost:5000/user/login
 * @apiVersion 1.0.0
 */
router.post('/user/login', async (req, res, next) => {
  try {
    const {
      user_name,
      password
    } = req.body
    const user = await UserModel.findOne({
      where: {
        user_name,
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
      if (user.roles === 'role_admin') {
        // 发送响应给前端
        res.send({
          status: 200,
          msg: '登录成功.',
          data: data,
          token: token
        })
      } else if (user.roles === 'role_normal') {
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
        status: 201,
        msg: '用户名或密码不正确.'
      })
    }
  } catch (error) {
    console.error('登陆异常.', error)
    res.send({
      status: 201,
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
 * @apiSampleRequest http://localhost:5000/user/logout
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
      status: 201,
      msg: '退出异常, 请重新尝试.'
    })
    next(error);
  }
})


// 用户批量导入，通过excel
// router.post('/user/upload/excel', (req, res, next) => {
//   uploadFile(req, res, function (err) {
//     if (err) {
//       return res.send({
//         status: 201,
//         msg: '上传文件失败'
//       })
//     } else {
//       const fileName = req.file.filename
//       const splitFileName = fileName.split('.');
//       // 支持的excel文件类有.xlsx .xls .xlsm .xltx .xltm .xlsb .xlam等
//       const ExcelType = splitFileName[splitFileName.length - 1];
//       if (ExcelType != 'xlsx' && ExcelType != 'xls' && ExcelType != 'xlsm' && ExcelType != 'xltx' && ExcelType != 'xltm' && ExcelType != 'xlsb' && ExcelType != 'xlam') {
//         res.status(201).json({
//           status: 201,
//           msg: '文件类型错误,请上传Excel文件!',
//           data: {},
//         });
//         return;
//       }
//       // 获取上传文件的位置
//       const filel = fs.readFile('../public/excel/1.xlsx', (err, data) => {
//         if (err) {
//           console.error(err)
//           return
//         }
//         console.log(data)
//       })
//       const excel_Dir = filel;
//       const CityArray = new Array('id', 'user_name', 'sex', 'password', 'roles');
//       const importConfig = {
//         excel_Dir,
//         CityArray,
//       }
//       try {
//         excelUtils.parseExcel(importConfig).then(user => {
//           if (user) {
//             console.log(`user`, user)
//             excelUtils.createExcel(user).then(excelData => {
//               if (excelData) {
//                 res.send({
//                   status: 200,
//                   msg: 'excel导入数据库成功'
//                 })
//               }
//             })
//             // 删除文件
//             excelUtils.deleteExcel(importConfig).then(delExcel => {
//               if (delExcel) {
//                 res.send({
//                   status: 201,
//                   msg: 'excel文件删除'
//                 })
//               }
//               return
//             })
//           }
//         })
//       } catch (error) {
//         console.error('退出异常.', error)
//         // 删除文件
//         excelUtils.deleteExcel(importConfig).then(delExcel => {
//           if (delExcel) {
//             res.send({
//               status: 201,
//               msg: 'excel文件删除'
//             })
//           }
//           return
//         })
//         res.send({
//           status: 201,
//           msg: '退出异常, 请重新尝试.'
//         })
//         next(error);
//       }
//     }

//   })
// })

// require('./excel.js')(router)

module.exports = router;