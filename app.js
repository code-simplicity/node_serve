// const createError = require('http-errors');
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const cors = require("cors");

const expressJWT = require("express-jwt");

const userRouter = require("./routes/user");
const excelRouter = require("./routes/excel");
const imageRouter = require("./routes/image");
const videoRouter = require("./routes/video");
const chooseRouter = require("./routes/choose");
const contentRouter = require("./routes/content");
const waveformsRouter = require("./routes/waveforms");
const wavestatsRouter = require("./routes/wavestats");
const portpointmapRouter = require("./routes/portpointmap");
const pointRouter = require("./routes/point");
const portmapRouter = require("./routes/portmap");
const portalUserExRouter = require("./routes/portal/userEx");
// 添加测试功能代码
const testRouter = require("./routes/test/code");
// 导入jwtUtils
const jwtUtils = require("./utils/jwtUtils");

const app = express();

// 私有秘钥
const PRIVITE_KEY = "bugdr_token";

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 处理跨域
app.use((req, res, next) => {
  //判断路径
  if (req.path !== "/" && !req.path.includes(".")) {
    res.set({
      "Access-Control-Allow-Credentials": true, //允许后端发送cookie
      "Access-Control-Allow-Origin": req.headers.origin || "*", //任意域名都可以访问,或者基于我请求头里面的域
      "Access-Control-Allow-Headers": "X-Requested-With,Content-Type", //设置请求头格式和类型
      "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS", //允许支持的请求方式
      "Content-Type": "application/json; charset=utf-8", //默认与允许的文本格式json和编码格式
    });
  }
  req.method === "OPTIONS" ? res.status(204).end() : next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userRouter);
app.use("/excel", excelRouter);
app.use("/image", imageRouter);
app.use("/video", videoRouter);
app.use("/choose", chooseRouter);
app.use("/content", contentRouter);
app.use("/waveforms", waveformsRouter);
app.use("/wavestats", wavestatsRouter);
app.use("/portpointmap", portpointmapRouter);
app.use("/point", pointRouter);
app.use("/portmap", portmapRouter);
app.use("/test", testRouter);
app.use("/portal", portalUserExRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// 解析token，获取用户信息
app.use(function (req, res, next) {
  const token = req.headers["authorization"];
  console.log(`token  object`, token);
  if (token === undefined) {
    // 直接退出，避免多次请求
    return;
  } else {
    jwtUtils
      .verToken(token)
      .then((data) => {
        req.data = data;
        return next();
      })
      .catch((err) => {
        console.log(`err`, err);
        // 直接退出，避免多次请求
        return;
      });
  }
});

// 验证token是否过期，并且规定哪一些路由是不需要token的
app.use(
  expressJWT({
    // 设置令牌
    secret: PRIVITE_KEY,
    // 设置加密算法
    algorithms: ["HS256"],
    // 校验是否存在token，有token才可以访问
    credentialsRequired: true,
  }).unless({
    path: ["/user/login", "/user/add", "/user/logout", "/user/info"],
  })
);

// error handler
app.use(function (err, req, res, next) {
  // 判断token是否存在
  if (err.name === "UnauthorizedError") {
    res.status(401).send({
      status: 301,
      msg: "token验证失败，请重新登录.",
    });
    return;
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
    // 直接退出，避免多次请求
    return;
  }
});

module.exports = app;