// const createError = require('http-errors');
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();

const {
  jwtAuth
} = require("./utils/jwtUtils")

// 返回结果的封装
const R = require("./utils/R")

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
const portalUserRouter = require("./routes/portal/user");
const portalUserExRouter = require("./routes/portal/userEx");
const captchaRouter = require("./routes/captcha");
// 添加测试功能代码
const testRouter = require("./routes/test/code");

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

// 验证token是否过期，并且规定哪一些路由是不需要token的，
// 校验token，获取headers⾥里里的Authorization的token，要写在路由加载之前，静态资源之后
// app.use(jwtAuth);
// app.use(
//   expressJWT({
//     // 设置令牌
//     secret: Constants.User.USER_COOKIE_DATA,
//     // 设置加密算法
//     algorithms: ["HS256"],
//     // 校验是否存在token，有token才可以访问
//     credentialsRequired: true,
//   }).unless({
//     path: ["/portal/user/login", "/portal/user/add", "/portal/user/check-token", "/captcha", "/portal/user/logout", "/portal/user/info"],
//   })
// );

// 加载路由
app.use("/", userRouter, captchaRouter);
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
app.use("/portal", portalUserExRouter, portalUserRouter);

// 错误处理
app.use((err, req, res, next) => {
  console.log('err', err)
  if (err.name === "UnauthorizedError") {
    res.status(401).send(R.fail("token验证失败，请重新登录."))
  } else {
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}
    res.status(err.status || 500)
    res.render("error")
  }
  next()
})

module.exports = app;