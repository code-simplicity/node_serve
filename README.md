

[TOC]

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



------

## 开发环境

IED：VSCode，Navicat。

编程语言： Node.js， mysql2，Vue.js等

数据库：Mysql

技术栈：Express +  mysql2 + nodemon + sequelize + http-errors等

## 功能说明

### 门户



### 管理中心



### 数据库设计

1. 用户表-tb_user
   - id-学号
   - user_name-姓名
   - password-密码
   - roles-角色
   - state-状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
2. 图片表-tb_image
   - id-图片id
   - url-图片路径
   - path-存储路径
   - type-图片类型
   - name-图片名称
   - state-图片状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
3. 视频表-tb_video
   - id-视频id
   - url-视频路径
   - path-视频存储路径
   - type-视频类型
   - name-图片名称
   - state-视频状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
4. 内容表tb_content
   - id-id
   - content-内容
   - state-内容状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间

创建数据库

```sql
CREATE DATABASE IF NOT EXISTS `design-project` CHAR SET utf8mb4 COLLATE utf8mb4_general_ci;
```

创建用户表

```mysql
CREATE TABLE `tb_user`  (
  `id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '学号',
  `user_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '姓名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码',
  `roles` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色,admin和user，管理员和普通用户',
  `state` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;
```

创建图片表

```mysql
CREATE TABLE `tb_image`  (
  `id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片id',
  `url` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片路径',
  `path` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片存储路径',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片类型',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片名称',
  `state` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;
```

创建视频表

```mysql
CREATE TABLE `tb_video`  (
  `id` int(11) NOT NULL COMMENT '视频id',
  `url` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '视频路径',
  `path` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '视频存储路径',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '视频类型',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '视频名称',
  `state` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;
```

创建内容表

```sql
CREATE TABLE `tb_content`  (
  `id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '内容id',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '内容',
  `state` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;
```

### 连接数据库

添加Sequelize 操作数据库

#### 安装

Sequelize 的使用可以通过 [npm](https://www.npmjs.com/package/sequelize) (或 [yarn](https://yarnpkg.com/package/sequelize)).

```sh
npm install --save sequelize
```

数据库安装驱动程

```sh
npm install --save mysql2
```

#### 配置环境

建立config-dev.js和config-prod.js环境

config-dev.js

```js
// 开发者环境
const configDev = {
    database: 'design-project', // 使用哪个数据库
    username: 'root', // 用户名
    password: '123456', // 口令
    host: 'localhost', // 主机名
    port: 3306 // 端口号，MySQL默认3306
};

// 暴露配置
module.exports = configDev;
```

config-prod.js

```js
// 开发者环境
const configProd = {
    database: 'design-project', // 使用哪个数据库
    username: 'root', // 用户名
    password: '123456', // 口令
    host: 'localhost', // 主机名
    port: 3306 // 端口号，MySQL默认3306
};

// 暴露配置
module.exports = configProd;
```

环境选择

```js
// 实际的配置环境

// 生产环境
const configDev = './config-dev'

// 上线环境
const configProd = './config-prod'

let config = ''
// 判断环境
if (process.env.NODE_ENV === 'development') {
    config = require(configDev)
} else {
    config = require(configProd)
}

// 暴露
module.exports = config;
```

#### 建立连接

编写db.js

```js
const {
    Sequelize
} = require('sequelize');
// 连接数据库
const config = require('./config')

// 配置数据库连接
const sequelizedb = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    // 连接池设置
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    },

    // 自定义日志
    logging: function (message) {
        console.debug(message);
    },
    // 全局配置表名和Model名称一致,全局禁用时间戳
    define: {
        freezeTableName: true,
        timestamps: false
    }
});

// 测试连接数据库是否成功
try {
    sequelizedb.authenticate();
    console.log('数据库连接成功');
} catch (error) {
    console.error('无法连接数据库，请检查重试:', error);
};

// 暴露配置
module.exports = sequelizedb;
```

------

### 生成Model模型实例

#### UserModel模型实例

```js
// 用户模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

// 返回一个用户模型架构
const UserModel = sequelizedb.define('tb_user', {
    // id
    id: {
        type: DataTypes.STRING(20),
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 用户名
    user_name: {
        type: DataTypes.STRING(32),
    },
    // 密码
    password: {
        type: DataTypes.STRING,
    },
    // 角色,默认为普通用户，user，admin为管理员
    roles: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1'
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
}, {});

// 模型同步
UserModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = UserModel;
```

#### ImageModel模型实例

```js
// 图片模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const ImageModel = sequelizedb.define('tb_image', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 图片路径
    url: {
        type: DataTypes.STRING(1024),
    },
    // 图片存储路径
    path: {
        type: DataTypes.STRING(1024),
    },
    // 图片类型,默认image/png
    type: {
        type: DataTypes.STRING,
        defaultValue: 'image/png'
    },
    // 图片名称
    name: {
        type: DataTypes.STRING,
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1'
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

}, {})

// 模型同步
ImageModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = ImageModel;
```

#### VideoModel模型实例

```js
// 视频模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const VideoModel = sequelizedb.define('tb_video', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 视频路径
    url: {
        type: DataTypes.STRING(1024),
    },
    // 视频存储路径
    path: {
        type: DataTypes.STRING(1024),
    },
    // 视频类型,默认video/mp4
    type: {
        type: DataTypes.STRING,
        defaultValue: 'video/mp4'
    },
    // 视频名称
    name: {
        type: DataTypes.STRING,
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1'
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

}, {})

// 模型同步
VideoModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = VideoModel;
```

#### ContentModel模型实例

```js
// 内容模型
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const ContentModel = sequelizedb.define('tb_content', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 内容
    content: {
        type: DataTypes.TEXT,
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1'
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

}, {})

// 模型同步
ContentModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = ContentModel;
```









## Node 项目热启动

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

------

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

首先使用excel模板添加一些数据

![excel模板](H:\AwebKF\毕业设计\项目\node_serve\public\images\excel模板.png)

然后接口请求

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\excel导入数据库接口请求.png)

接下来我们查看数据库是否有数据，如果数据插入成功，那么怎么我们这个就可以了。到此我们的excel模板导入数据库就成功了。

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\数据库用户数据.png)
