// const createError = require('http-errors');
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const app = express();
const {
  jwtAuth
} = require("./utils/jwtUtils")

const videoRouter = require("./routes/video");
const waveformsRouter = require("./routes/waveforms");
const wavestatsRouter = require("./routes/wavestats");
const portpointmapRouter = require("./routes/portpointmap");
const pointRouter = require("./routes/point");
const portmapRouter = require("./routes/portmap");

// 门户接口
const portalUserRouter = require("./routes/portal/user");
const portalUserExRouter = require("./routes/portal/userEx");
const portalContentRouter = require("./routes/portal/content");
const portalPortMapRouter = require("./routes/portal/portmap");
const portalVideoRouter = require("./routes/portal/video");
const portalChooseRouter = require("./routes/portal/choose");
const portalPortPointMapRouter = require("./routes/portal/portpointmap");
const portalPointMapRouter = require("./routes/portal/point");
const portalWaveFormsRouter = require("./routes/portal/waveforms");
const portalWaveStatsRouter = require("./routes/portal/wavestats");

// 管理员接口
const adminUserRouter = require("./routes/admin/userRouter")
const adminExcelRouter = require("./routes/admin/excelRouter")
const adminChooseRouter = require("./routes/admin/chooseRouter")
const adminContentRouter = require("./routes/admin/contentRouter")
const adminVideoRouter = require("./routes/admin/videoRouter")
const adminPortMapRouter = require("./routes/admin/portMapRouter")

// 图灵验证码
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested_With", //设置请求头格式和类型
      "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS", //允许支持的请求方式
      "Content-Type": "application/json; charset=utf-8", //默认与允许的文本格式json和编码格式
    });
  }
  if (req.method.toLowerCase() == "options") {
    res.status(204).send(200)
  } else {
    next()
  }
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

// 加载路由
app.use("/", captchaRouter);
app.use("/video", videoRouter);
app.use("/waveforms", waveformsRouter);
app.use("/wavestats", wavestatsRouter);
app.use("/portpointmap", portpointmapRouter);
app.use("/point", pointRouter);
app.use("/portmap", portmapRouter);
app.use("/test", testRouter);
app.use("/portal", portalUserExRouter, portalUserRouter, portalContentRouter,
  portalPortMapRouter, portalVideoRouter, portalChooseRouter, portalPortPointMapRouter,
  portalPointMapRouter, portalWaveFormsRouter, portalWaveStatsRouter
);

app.use("/admin", adminUserRouter, adminExcelRouter, adminChooseRouter,
  adminContentRouter, adminVideoRouter, adminPortMapRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({
      error: 'Something failed!'
    })
  } else {
    next(err)
  }
}

function errorHandler(err, req, res, next) {
  res.status(500)
  res.render('error', {
    error: err
  })
}

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

// 错误处理
app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}
  res.status(err.status || 500).send('Something broke!')
})

module.exports = app;