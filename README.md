# node_serve	毕设项目后端接口文档说明
## 启动方法

首先拉取代码

```shell
git clone https://github.com.cnpmjs.org/dpy0912/node_serve.git
```

使用VsCode打开项目，之后更新依赖包，然后相关下载依赖

```shell
npm install
```

运行项目,启动项目之后

```shell
npm run dev
```

## 所用技术栈

Express +  mysql2 + nodemon + sequelize + http-errors

nodemon  ==》 node 项目热启动

全局安装该命令

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\nodemon.png)

```shell
npm install nodemon -g
```

项目依赖安装

```shell
npm install nodemon
```

package.json目录下添加配置，启动nodemon

```json
 "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www"
  },
```

使用命令启动项目，就可以做到项目热启动了，更改代码之后会刷新。

```shell
npm run dev
```

使用浏览器打开，或者使用postman接口测试工具进行连接测试

## 返回状态码统一规定

```shell
status  |状态表示的意思
200 ==》 操作成功
201 ==》 操作异常
500 ==》 服务器异常
```

## 接口文档请求地址

### 集成ApiDoc接口文档

#### 安装

通过注释，统一集成接口请求文档，首先下载apidoc依赖，先全局安装,这样就可以使用apidoc命令了，[apidoc官网](https://apidocjs.com/)

```shell
npm install apidoc -g
```

在Node.js项目中引入依赖

```shell
npm install apidoc
```

apidoc提供了很多的注释样例，它几乎支持目前主流的所有风格的注释。例如：Javadoc风格注释(可以在C#, Go, Dart, Java, JavaScript, PHP, TypeScript等语言中使用)

```
/**
 * This is a comment.
 */
```

#### 配置使用

在本次开发项目中，为了开发便捷，避免大量的编写接口文档，方便开发。

##### 方法一

在项目根目录创建一个apidoc.json配置项，这里可以做简单的配置。

```json
{
    "name": "项目后端接口文档",
    "title": "项目后端接口文档",
    "description": "毕设接口文档",
    "version": "1.0.0",
    "url": "http://localhost:5000"
}
```

##### 方法二

如果你的项目中使用了`package.json`文件(例如:node.js工程)，那么你可以将`apidoc.json`文件中的所有配置信息放到`package.json`文件中的*apidoc*参数中：

```json
 "apidoc": {
    "name": "项目后端接口文档",
    "title": "项目后端接口文档",
    "description": "毕设接口文档",
    "version": "1.0.0",
    "url": "http://localhost:5000"
  }
```

具体配置项以及参数说明可以查看上方提供的官网地址。

#### 在项目中使用

这里就举一个添加用户的例子，这是添加用户的接口例子

```js
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
```

接下来就是生成接口文档，执行命令，这里简单介绍一下命令参数的含义，

```shell
apidoc -i routes/ -o public/apidoc
参数    含义
-i      指定读取源文件的目录，例如：apidoc -i routes/ 意为读取routes/目录下面的源文件，默认值:./
-o      指定输出文档的目录，例如：apidoc -o public/apidoc 意为输出文档到public/apidoc目录下，默认值:./doc/
```

如图所示就可以查看到生成的文档在哪一个目录下了

![接口文档生成](H:\AwebKF\毕业设计\项目\node_serve\public\images\接口文档生成地址.png)

接下来就是打开接口文档了，在浏览器输入

```json
http://localhost:5000/apidoc/index.html
```

如图所示

![接口文档-添加用户](H:\AwebKF\毕业设计\项目\node_serve\public\images\添加用户.png)

到此基本就完成了，不过如果你访问不到，那么需要放行你的静态文件夹了，比如这样，在app.js中这样编写。

```js
app.use(express.static(path.join(__dirname, 'public')));
```

## NodeJs + multer+ node-xlsx实现excel导入mysql

### 项目说明

本次项目需要批量导入数据到数据库，导出数据库生成excel，话不多说，这里就介绍怎么使用excel模板导入数据到数据库

### 项目安装插件

安装node-xlsx插件，这是一款支持的excel文件类有.xlsx .xls .xlsm .xltx .xltm .xlsb .xlam等插件，基本满足需求 [插件的github地址](https://github.com/mgcrea/node-xlsx) 

```shell
npm install node-xlsx --save
```

安装multer，multer是一个node.js中间件，用于处理 `multipart/form-data`类型的表单数据，主要用于上传文件，在form表单上要加上 enctype=“multipart/form-data” 的属性。Multer 不会处理任何非 multipart/form-data 类型的表单数据。不要将 Multer 作为全局中间件使用，因为恶意用户可以上传文件到一个你没有预料到的路由，应该只在你需要处理上传文件的路由上使用。

```shell
npm install --save multer
```

### 目录结构说明

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\项目模板.png)

#### UserMode模块

这里其实就是sequelize实例化mysql，不用直接操作mysql，完成映射关系

```js
// 用户模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

// 返回一个用户模型架构
const UserModel = sequelizedb.define('tb_user', {
    // 在这里定义模型属性
    // id
    id: {
        type: DataTypes.STRING,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 用户名
    user_name: {
        type: DataTypes.STRING
    },
    // 性别
    sex: {
        type: DataTypes.STRING
    },
    // 密码
    password: {
        type: DataTypes.STRING
    },
    // 角色,默认为普通用户，role_normal，role_admin为管理员
    roles: {
        type: DataTypes.STRING,
        defaultValue: 'role_normal'
    },
    // 创建时间
    create_time: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now
    },
    // 更新时间
    update_time: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now
    }
}, {

});

// 向外暴露UserModel
module.exports = UserModel;
```

#### excel.js路由文件

这里基本上代码都注释了，不用过多说明

```js
// 处理excel导入,导出
const express = require('express');

const path = require('path')
const fs = require('fs')

const xlsx = require("node-xlsx");

const multer = require('multer')

const router = express.Router();

// 处理excel文件
const upload = multer({
    dest: "../public/upload"
});

// 定义全局数组
const excelHead = [
    "id",
    "user_name",
    "sex",
    "password",
    "roles"
];

// 导入暴露的模型
const UserModel = require('../models/UserModel')

const excelUtils = require('../utils/excelUtils')

/**
 * 1. 点击下载excel模板，生成blob流给前端
 * 2. excel模板输入信息后导入，解析数据(先存到服务器，服务器改名后node-xlsx读取，添加到数据库)存入数据库，存入成功给前端状态，前端重新调用init
 * 3. 前端批量导出，传递过来ids，我们利用ids查询，然后生成数据，blob流返回给前端
 */
router.get("/export", (req, res) => {
    const excelData = [{
        name: "用户模板.xlsx", // 给第一个sheet指名字
        data: [
            [
                "学号",
                "姓名",
                "性别",
                "密码",
                "类型"
            ],
        ],
    }, ];
    const optionArr = {
        "!cols": [{
                wch: 10
            },
            {
                wch: 10
            },
            {
                wch: 10
            },
            {
                wch: 10
            },
            {
                wch: 10
            }
        ],
    };
    res.send(xlsx.build(excelData, optionArr));
});

// excel导入文件,得先存下才能获取到具体内容
router.post('/upload', upload.single('file'), (req, res, next) => {
    try {
        // 重命名文件夹
        fs.rename(
            req.file.path,
            req.file.destination + "/" + "用户模板.xlsx",
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        )
        // 解析模板,返回对象形式的键值对
        const excelObj = xlsx.parse("../public/upload/用户模板.xlsx")
        console.log(`excelObj`, excelObj[0].data)
        const dataArr = excelObj[0].data;
        // 判断是不是使用的指定模板导入的
        if (excelObj[0].data[0].toString() === "学号,姓名,性别,密码,类型") {
            // 删除二位数组第一项，也就是表头数据
            dataArr.shift()
            // 遍历
            dataArr.map((item) => {
                const addData = {}
                excelHead.map((key, index) => {
                    addData[key] = item[index] ? item[index] : ''
                })
                console.log(`addData`, addData)
                // 使用模板插入数据
                UserModel.create(
                    addData
                ).then(user => {
                    if (user) {
                        return res.send({
                            status: 200,
                            msg: '成功导入excel到数据库.'
                        })
                    }
                }).catch(err => {
                    res.send({
                        status: 201,
                        msg: '模板匹配错误，请检查关键字.'
                    })
                    next(err)
                })
            })
        } else {
            // 不是的话,返回给前端错误状态
            return res.send({
                status: 201,
                msg: '模板匹配错误，请检查关键字.'
            })
        }
    } catch (error) {
        console.error('导入异常.', error)
        res.send({
            status: 201,
            msg: '导入异常, 请重新尝试'
        })
    }

})

module.exports = router;
```

#### app.js配置路由

这里只是省略的代码

```js
const express = require('express');
...
// 引入模板文件
const excelRouter = require('./routes/excel');
// 接口的配置
app.use('/excel', excelRouter);
...
```

### excel模板导入数据到mysql接口请求

```shell
http://localhost:5000/excel/upload
```

模拟请求

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\excel导入mysql.png)

