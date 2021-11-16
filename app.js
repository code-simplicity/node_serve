const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require("cors");

const expressJWT = require('express-jwt');


const userRouter = require('./routes/user');
const excelRouter = require('./routes/excel');
const imageRouter = require('./routes/image');
const videoRouter = require('./routes/video');
// 导入jwtUtils
const jwtUtils = require('./utils/jwtUtils');

const app = express();

// 私有秘钥
const PRIVITE_KEY = 'bugdr_token'

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 处理跨域
app.use(cors({
  maxAge: 5,
  credentials: true, // 发送cookie
  origin: 'http://localhost:8080',
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization']
}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/excel', excelRouter);
app.use('/image', imageRouter);
app.use('/video', videoRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// 解析token，获取用户信息
app.use(function (req, res, next) {
  const token = req.headers['authorization']
  console.log(`token  object`, token)
  if (token === undefined) {
    // 直接退出，避免多次请求
    return
  } else {
    jwtUtils.verToken(token).then((data) => {
      req.data = data
      return next()
    }).catch((err) => {
      console.log(`err`, err)
      // 直接退出，避免多次请求
      return
    })
  }
})

// 验证token是否过期，并且规定哪一些路由是不需要token的
app.use(expressJWT({
  // 设置令牌
  secret: PRIVITE_KEY,
  // 设置加密算法
  algorithms: ['HS256'],
  // 校验是否存在token，有token才可以访问
  credentialsRequired: true
}).unless({
  path: ['/user/login', '/user/add', '/user/logout']
}))

// error handler
app.use(function (err, req, res, next) {
  // 判断token是否存在
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      status: 201,
      msg: 'token验证失败，请重新登录.'
    })
    return
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    // 直接退出，避免多次请求
    return
  }

});

module.exports = app;