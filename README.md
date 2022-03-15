# node_serve毕设项目后端接口文档说明

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

## 项目组成

本项目是一个前后端分离的项目，一共分为后端，管理端和展示端。

## 门户

门户具体查看[毕设门户展示](https://github.com/dpy0912/educational_reformp-project)

## 管理中心

管理中心查看[毕设管理中心](https://github.com/dpy0912/graduation-project-admin)

## 后端接口

### 数据库设计

1. 用户表-tb_user
   - id-学号
   - user_name-姓名
   - password-密码
   - roles-角色
   - state-状态（0表示删除，1表示正常）
   - score-得分
   - create_time-创建时间
   - update_time-更新时间
2. 图片表-tb_image---目前不需要这个总表了
   - id-图片id
   - url-图片路径
   - path-存储路径
   - type-图片类型
   - name-图片名称
   - state-图片状态（0表示删除，1表示正常）
   - water_level-水位
   - wave_direction-波浪方向
   - embank_ment-堤坝布置位置
   - create_time-创建时间
   - update_time-更新时间
3. 视频表-tb_video
   - id-视频id
   - url-视频路径
   - path-视频存储路径
   - type-视频类型
   - name-视频名称
   - state-视频状态（0表示删除，1表示正常）
   - water_level-水位
   - wave_direction-波浪方向
   - embank_ment-堤坝布置位置
   - create_time-创建时间
   - update_time-更新时间
4. 内容表tb_content
   - id-内容id
   - choose_id-选择表的id（外键）
   - content-内容
   - state-内容状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
5. 选择表-tb_choose
   - id-选择id
   - content-选择内容
   - category-内容类别
   - state-内容状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
6. 波形图表-tb_wave_forms
   - id-波形图表id
   - point_id-点位表id(外键)
   - url-图片路径
   - path-存储路径
   - type-图片类型
   - name-图片名称
   - state-图片状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
7. 波统计图表-tb_wave_stats
   - id-波统计图表id
   - point_id-点位表id(外键)
   - url-图片路径
   - path-存储路径
   - type-图片类型
   - name-图片名称
   - state-图片状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
8. 港口地图表-tb_port_map
   - id-港口地图表id
   - url-图片路径
   - path-存储路径
   - type-图片类型
   - name-图片名称
   - state-图片状态（0表示删除，1表示正常）
   - create_time-创建时间
   - update_time-更新时间
9. 港口点位地图表-tb_port_point_map
   - id-港口点位地图表id
   - url-图片路径
   - path-存储路径
   - type-图片类型
   - name-图片名称
   - state-图片状态（0表示删除，1表示正常）
   - water_level-水位
   - wave_direction-波浪方向
   - embank_ment-堤坝布置位置
   - create_time-创建时间
   - update_time-更新时间
10. 点位表-tb_point
    - id-点位表id
    - port_point_map_id-港口点位地图表id（外键）
    - content-点位内容
    - state-图片状态（0表示删除，1表示正常）
    - create_time-创建时间
    - update_time-更新时间

#### 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS `design_project` CHAR SET utf8mb4 COLLATE utf8mb4_general_ci;
```

#### 创建用户表

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

#### 创建图片表

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

#### 创建视频表

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

#### 创建内容表

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

添加`Sequelize`中间件操作数据库。不需要编写`Sql`语句，隔离开来。

#### 安装Sequelize

`Sequelize`的使用可以通过 [npm](https://www.npmjs.com/package/sequelize) (或 [yarn](https://yarnpkg.com/package/sequelize)).

```sh
npm install --save sequelize
```

##### 数据库安装驱动程

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



## Node项目配置pm2，解决Node接口异常停止服务的问题

1. 在开发的时候，出现了接口异常，然后服务就停止了，这就不利于维护和开发了，所以我们需要将项目进行热启动，并且还能做日志检测，报错了可以有迹可循

2. 首先就是全局安装pm2项目管理工具

   ```sh
   npm install pm2
   ```

3. 接下来就是在我们项目根目录添加一个processes.json的配置文件

   ```json
   {
       "apps": [
       {
        "name": "node-serve",
        "cwd": "./logs",
        "script": "bin/www.js",
        "log_date_format": "YYYY-MM-DD HH:mm:ss",
        "error_file": "/var/log/node-app/node-app.stderr.log",
        "out_file": "log/node-app.stdout.log",
        "pid_file": "pids/node-geo-api.pid",
        "instances": 6,
        "min_uptime": "200s",
        "max_restarts": 10,
        "max_memory_restart": "1M",
        "cron_restart": "1 0 * * *",
        "watch": false,
        "merge_logs": true,
        "exec_interpreter": "node",
        "exec_mode": "fork",
        "autorestart": false,
        "vizion": false
       }
       ]
      }
   ```

4. 接下来就是在脚手架搭起来的项目中的package.json加入这个配置

   ```json
    "scripts": {
       "start": "node ./bin/www",
       "dev": "nodemon ./bin/www",
       "pm2":"pm2 start processes.json"
     },
   ```

5. 直接使用命令就可以启动项目了

   ```sh
   npm run pm2
   ```

6. 这样就完成了pm2对项目奔溃进行热启动了

## 服务器安装Node

1. 首先就是下载Node安装环境，如果服务器下载很慢，那么可以在本地下载好之后通过ftp上传，首先去Nodejs官网下载，具体看这篇文章https://blog.csdn.net/u012570307/article/details/119968668



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
20000 ==》 操作成功
40000 ==》 操作失败
50000 ==》 服务器异常
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
    "url": "http://localhost:5050"
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
    "url": "http://localhost:5050"
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
 * @apiSampleRequest http://localhost:5050/user/add
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
http://localhost:5050/apidoc/index.html
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
http://localhost:5050/excel/upload
```

模拟请求

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\excel导入mysql.png)

首先使用excel模板添加一些数据

![excel模板](H:\AwebKF\毕业设计\项目\node_serve\public\images\excel模板.png)

然后接口请求

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\excel导入数据库接口请求.png)

接下来我们查看数据库是否有数据，如果数据插入成功，那么怎么我们这个就可以了。到此我们的excel模板导入数据库就成功了。

![](H:\AwebKF\毕业设计\项目\node_serve\public\images\数据库用户数据.png)

------

## Node.js集成日志记录模块

### 安装

首先安装winston，配置应用的日志，并具有可定制化的特性

```sh
npm install winston
```

## 部署教程

### docker部署后端

1. 首先从本地将工程文件拷贝到服务器的指定目录，

2. 第二就是运行Dockerfile文件，这个文件是运行项目的配置文件，我们将文件使用docker容器进行部署，这样就可以配置好了，

   ```sh
    FROM node:16.13.1

    ENV NODE_ENV=production

    RUN mkdir -p /nodeServe

    COPY . /nodeServe

    WORKDIR /nodeServe

    RUN npm config set registry "https://registry.npm.taobao.org/" \
        && npm install

    EXPOSE 5050

    CMD ["npm", "run", "start"]
   ```

3. 在工程根目录下运行，这里要设置一直运行node服务，即使出现异常，那么这个东西也不会挂掉，docker就有这样的一个好处，其实这块可以编写一个docker-compose.yml配置文件进行编写的。

    ```sh
    version: '2.0'
    services:
        node-serve:
        restart: always
        image: node-serve-1.0
        container_name: node-serve
        ports:
         - 5050:5050
    ```

   ```sh
    docker build . -t node-serve
    docker-compose up -d
   ```

4. 通过以上命令就可以访问到我们后端接口了，这里可以做一个代理，用来解决跨域的问题，

5. 通过服务器给的ip地址+端口就可以访问到我们的接口服务了

   ```sh
   http://8.131.240.89:5050/apidoc/index.html
   ```

6. 到此我们的后端就部署完成了，之后就是使用`Nginx`做代理请求，走域名的方式进行。

### 后端部署另外一种方式，采用pm2部署

1. 首先将代码拉取到服务器指定目录，进入到服务器

2. 其次就是安装node环境了，这里我们直接去node.js官网下载好构建的文件，然后配置地址映射，这里就先这样，这里的版本是已经变异好的linux版本，直接拉取就行，如果服务器拉取该包失败，可以从本地通过ftp上传文件到服务器，通过该地址下载 [Node.js下载地址](https://nodejs.org/en/download/) 

   ```sh
   wget https://nodejs.org/dist/v16.13.0/node-v16.13.0-linux-x64.tar.xz
   ```

3. 我们现在直接采用第二种，本地下载上传到f服务器，首先就是通过地址链接，选择linux版本的，

4. 上传之后，在root下创建一个目录,配置node npm cnpm

   ```sh
   cd root
   mkdir nodejs
   cd nodejs
   #复制这个文件到该目录下
   mv node-v16.13.0-linux-x64.tar.xz nodejs
   #解压文件
   tar xf node-v16.13.0-linux-x64.tar.xz
   #进入该目录
   cd node-v16.13.0-linux-x64.tar.xz
   #配置软链接， node -v
   ln -s /root/nodejs/node-v16.13.0-linux-x64/bin/node /usr/bin/node
   # 配置npm
   ln -s /root/nodejs/node-v16.13.0-linux-x64/bin/npm /usr/bin/npm
   npm -v
   #配置cnpm 
   #首先安装淘宝链接
   npm install -g cnpm --registry=https://registry.npm.taobao.org
   ln -s /root/nodejs/node-v14.15.5-linux-x64/bin/cnpm /usr/local/bin/cnpm
   cnpm -v
   // 查看版本
   node -v
   ```

5. 安装pm2

   ```sh
   npm install pm2 -g
   ```

6. 配置pm2软连接

   ```sh
   ln -s /root/nodejs/node-v16.13.0-linux-x64/bin/pm2 /usr/local/bin/
   ```

7. pm2就配置好了
8. 接下来就是启动node.js服务了，首先就是在后端目录下

   ```sh
   npm install
   #启动node
   pm2 start bin/www.js
   ```

9. 这样就部署好后端了，我们通过ip地址+端口就可以访问到我们后端地址了,这个就是后端的接口地址，

   ```http
   http://8.131.240.89:5000/apidoc/index.html
   ```

10. 为什么采用pm2呢,因为项目奔溃之后可以进行重启。
11. 最后配置nginx进行反向代理，配置nginx静态资源，走内网穿透，
12. 但是我们不推荐这种，推荐使用`docker`部署。

### docekr部署管理端（不推荐）

1. 首先拷贝工程文件到服务器，然后编写Dockerfile

   ```sh
   FROM node:15.9.0
   
   ENV NODE_ENV=production
   
   RUN mkdir -p /graduationProjectAdmin
   
   COPY . /graduationProjectAdmin
   
   WORKDIR /graduationProjectAdmin
   
   RUN npm config set registry "https://registry.npm.taobao.org/" \
       && npm install --legacy-peer-deps
   
   EXPOSE 3333
   
   CMD ["npm", "run", "dev"]
   ```

2. 在工程根目录下运行

   ```sh
   docker build . -t graduation-project-admin
   docker run -d --restart=always -p 3333:3333 graduation-project-admin
   ```

3. 通过以上命令就可以访问到我们后端接口了，这里可以做一个代理，用来解决跨域的问题，

4. 通过服务器给的ip地址+端口就可以访问到我们的接口服务了

### 采用nginx部署管理端静态站点

#### docker配置nginx

在服务器创建一个`Nginx`目录，编写`docker-compose.yml`拉取`Nginx`镜像。

```sh
version: '2.0'
services:
  nginx:
    restart: always
    image: nginx:1.19.2-alpine
    container_name: node-nginx
    ports:
      - 80:80
      - 443:443
    volumes:
      - "/root/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf"
      - "/root/docker/nginx/wwwroot:/usr/share/nginx/wwwroot"
      - "/root/docker/nginx/log:/var/log/nginx"
      - "/root/docker/nginx/cret:/etc/nginx/cret"
```

这里需要将`volumes`路径换了，换成自己nginx所在的目录，才可以做正确的地址映射。

启动构建`Nginx`镜像。

```sh
docker-compose up -d
```

这样`Nginx`就启动好了，然后在`nginx`目录下的`wwwroot`目录下创建两个文件夹，分别是`mp`和`proj`，然后将打包的管理端以及门户分别放到这两个文件夹。

在`conf`目录下创建`nginx.conf`文件。

##### nginx.conf

```sh
user  nginx;
worker_processes  1;

events {
    worker_connections  1024;
}
http {

    gzip  on;   #开启gzip
    gzip_min_length 1k; #低于1kb的资源不压缩
    gzip_comp_level 3; #压缩级别【1-9】，越大压缩率越高，同时消耗cpu资源也越多，建议设置在4左右。
    gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css;  #需要压缩哪些响应类型的资源，多个空格隔开。不建议压缩图片，下面会讲为什么。
    gzip_disable "MSIE [1-6]\.";  #配置禁用gzip条件，支持正则。此处表示ie6及以下不启用gzip
    gzip_vary on;  #是否添加“Vary: Accept-Encoding”响应头

	upstream node-serve-api{
		server 172.30.50.4:5050 weight=1;
	}

    include mime.types;

    keepalive_timeout  65;

   #以下属性中，以ssl开头的属性表示与证书配置有关。
   server {
	     listen 80;
         listen 443 ssl;
         server_name www.bugdr.cn;
         root html;
         index index.html index.htm;
         ssl_certificate ssl/5479691_www.bugdr.cn.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
         ssl_certificate_key ssl/5479691_www.bugdr.cn.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
         ssl_session_timeout 10m;
         ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
         #表示使用的加密套件的类型。
         ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #表示使用的TLS协议的类型。
         ssl_prefer_server_ciphers on;
	    location / {
			proxy_pass   http://node-serve-api;
			#以下是一些反向代理的配置可删除
			proxy_redirect             off;
			#后端的Web服务器可以通过X-Forwarded-For获取用户真实IP
			proxy_set_header           Host $host;
			proxy_set_header           Cookie $http_cookie;
			proxy_set_header           X-Real-IP $remote_addr;
			proxy_set_header           X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header           HTTP_X_FORWARDED_FOR $remote_addr;
			proxy_set_header           X-Forwarded-Server $host;
		}
    }
   server {
	    listen 80;
	    listen 443 ssl;
         server_name mp.bugdr.cn;
         root html;
         index index.html index.htm;
         ssl_certificate ssl/5479457_mp.bugdr.cn.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
         ssl_certificate_key ssl/5479457_mp.bugdr.cn.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
         ssl_session_timeout 5m;
         ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
         #表示使用的加密套件的类型。
         ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #表示使用的TLS协议的类型。
         ssl_prefer_server_ciphers on;
         
		location ^~/user/ {
			proxy_pass   http://node-serve-api;
			#以下是一些反向代理的配置可删除
			proxy_redirect             off;
			#后端的Web服务器可以通过X-Forwarded-For获取用户真实IP
			proxy_set_header           Host $host;
			proxy_set_header           Cookie $http_cookie;
			proxy_set_header           X-Real-IP $remote_addr;
			proxy_set_header           X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header           HTTP_X_FORWARDED_FOR $remote_addr;
			proxy_set_header           X-Forwarded-Server $host;
		 }
		
		 location ^~/admin/ {
			proxy_pass   http://node-serve-api;
			#以下是一些反向代理的配置可删除
			proxy_redirect             off;
			#后端的Web服务器可以通过X-Forwarded-For获取用户真实IP
			proxy_set_header           Host $host;
			proxy_set_header           Cookie $http_cookie;
			proxy_set_header           X-Real-IP $remote_addr;
			proxy_set_header           X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header           HTTP_X_FORWARDED_FOR $remote_addr;
			proxy_set_header           X-Forwarded-Server $host;
		}
		
		location ^~/portal/ {
			proxy_pass   http://node-serve-api;
			#以下是一些反向代理的配置可删除
			proxy_redirect             off;
			#后端的Web服务器可以通过X-Forwarded-For获取用户真实IP
			proxy_set_header           Host $host;
			proxy_set_header           Cookie $http_cookie;
			proxy_set_header           X-Real-IP $remote_addr;
			proxy_set_header           X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header           HTTP_X_FORWARDED_FOR $remote_addr;
			proxy_set_header           X-Forwarded-Server $host;
		}
		
		location / {
			root   /usr/share/nginx/wwwroot/mp;
			index  index.html index.htm;
		}
	}

   server {
	    listen 80;
	    listen 443 ssl;
         server_name proj.bugdr.cn;
         root html;
         index index.html index.htm;
         ssl_certificate ssl/6982572_proj.bugdr.cn.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
         ssl_certificate_key ssl/6982572_proj.bugdr.cn.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
         ssl_session_timeout 5m;
         ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
         #表示使用的加密套件的类型。
         ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #表示使用的TLS协议的类型。
         ssl_prefer_server_ciphers on;
         
		location / {
			root   /usr/share/nginx/wwwroot/proj;
			index  index.html index.htm;
		}
	}

}
```

这里就不用做上面配置的说明，具体可以自行百度说明。

之后我们就可以通过域名访问到我们的项目了。

最后说明一下，管理端以及门户的api可以换成服务器的ip地址,这样就是直接绑定域名进行访问的。

## 使用腾讯云对象存储，改变视频，图片等文件的存储方式

### 1、实名注册腾讯云，并且激活对象存储的服务

首先是自己在腾讯云实名注册过，如何直接在腾讯云搜索对象存储，这个时候会让开启对象存储的权限，这里就不做演示了。

[对象存储的url地址](https://console.cloud.tencent.com/cos/bucket)

### 2、创建存储桶

访问该[对象存储](https://console.cloud.tencent.com/cos/bucket)的控制台进行`存储桶`的创建，按照下面的图片步骤即可。

![对象存储1](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A81.png)

![对象存储2](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A82.png)

![对象存储3](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A82.png)

之后`存储桶`就创建好了。

### 3、下载COSBrowser对象存储可视化工具

首先可以查看`存储桶`的一些配置，当然这个对象存储前6个月是免费的，有50G的存储额度。过了6个月以后存储需要进行收费，这个可以具体看一下收费标准，也是比较便宜的。

![对象存储4](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A84.png)

下载`COSBrowser`连接如下：

```http
https://cloud.tencent.com/document/product/436/38103
```

![对象存储5](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A85.png)

我电脑的是`Windows`版本，就下载了一个，然后这里安装登陆很简单的，按照提示一步一步走就行。

![对象存储6](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A86.png)

### 使用Node.js实现文件上传到对象存储

这里为什么使用`Node.js`，因为我毕设后端就是`Node.js`写的。

首先将`cos-nodejs-sdk-v5`下来加入到项目依赖包中，直接使用命令：

```sh
npm install cos-nodejs-sdk-v5 --save
```

然后查看项目依赖：

![对象存储7](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A87.png)

#### 配置 SecretId、SecretKey

去[api秘钥管理获取](https://console.cloud.tencent.com/cam/capi)`SecretId`、`SecretKey`。

![对象存储8](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A88.png)

先将这些配置抽取成一个对象存储起来，方便全局调用。

```js
// 腾讯云对象存储配置
const txCosConfig = {
  // id
  SecretId: "xxxx",
  // key
  SecretKey: "xxxx",
  // 存储桶名字
  Bucket: "bugdr-project-1305152720",
  // 存储桶Region，也就是地点，可以在COS控制台指定存储桶的概览页查看
  Region: "ap-beijing",
}
```

#### 上传文件到指定文件夹下面

```js
// portmap.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  Op
} = require("sequelize");
const router = express.Router();
// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');
// 表单上传文件
const multer = require("multer");
// 一些工具
const utils = require("../utils/utils");
// 统一返回结果
const R = require("../utils/R")

// 引入常量
const Constants = require("../utils/Constants")

// 创建对象存储实例
const cos = new COS({
  SecretId: Constants.txCosConfig.SecretId,
  SecretKey: Constants.txCosConfig.SecretKey,
})

// 上传的存储路径，后面需要删除
const dirPath = path.join("./");
const upload = multer({
  dest: dirPath
});

// 创建cos上传存储的位置
const uploadUrl = "node-serve/port-map/"

/**
 * 上传港口地图
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  /**
   * filename：是文件名的hash，"8e7c4c36a823cd4bd9508167cfc679a6"
   * mimetype 文件类型：'image/png'
   * originalname：原来的名字
   */
  const {
    filename,
    mimetype,
    originalname
  } = req.file
  // 图片重命名
  await fs.rename(filename, originalname, (error) => {
    if (error) {
      return res.send(R.fail("图片重命名失败."))
    } else {
      // 上传文件的路径
      const localFile = dirPath + originalname
      const key = uploadUrl + originalname
      // 腾讯云上传文件
      const params = {
        Bucket: Constants.txCosConfig.Bucket,
        Region: Constants.txCosConfig.Region,
        // 上传文件执行的目录，作为key存在
        Key: key,
        // 上传文件路径
        FilePath: localFile,
        // 表示文件大小超出一个数值时使用分块上传
        SliceSize: 1024 * 1024 * 3,
      }
      let result = {}
      // 上传任务的回调
      let taskStatus = ""
      // 上传进度的对象
      let onHashProgress = {}
      let onProgress = {}
      cos.sliceUploadFile({
        ...params,
        // 上传任务创建时的回调函数，返回一个 taskId，
        // 唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）
        onTaskReady: (taskId) => {
          taskStatus = taskId
        },
        // 计算文件 MD5 值的进度回调函数，回调参数为进度对象 progressData
        onHashProgress: (progressData) => {
          onHashProgress = progressData
        },
        // 上传文件的进度回调函数，回调参数为进度对象 progressData
        onProgress: (progressData) => {
          onProgress = progressData
        }
      }, async (err, data) => {
        try {
          if (err) {
            return res.send(R.fail("图片上传失败."))
          } else {
            // 首先删除上传到本地的文件
            fs.unlinkSync(localFile)
            // 保存图片信息到相关表格中
            result = {
              taskStatus,
              onHashProgress: onHashProgress,
              onProgress: onProgress
            }
            const {
              dataValues
            } = await PortMapModel.create({
              url: data.Location,
              path: data.Key,
              type: mimetype,
              name: originalname,
            })
            if (dataValues !== null) {
              return res.send(R.success({
                result,
                ...data
              }, "图片上传成功."))
            } else {
              return res.send(R.fail("图片上传失败."))
            }
          }
        } catch (error) {
          return res.send(R.fail("图片上传失败."))
        }
      })
    }
  });
});
```

以上就是一个图片上传的代码，基本是就是调用官方给的api，核心代码主要是这些

```js
// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');

// 存储路径
const dirPath = path.join("./");
const upload = multer({
  dest: dirPath
});

// 创建cos上传存储的位置
const uploadUrl = "node-serve/port-map/"

// 上传文件的路径
const localFile = dirPath + originalname
const key = uploadUrl + originalname

// 上传文件的路径
const localFile = dirPath + originalname
const key = uploadUrl + originalname
// 腾讯云上传文件
const params = {
  Bucket: Constants.txCosConfig.Bucket,
  Region: Constants.txCosConfig.Region,
  // 上传文件执行的目录，作为key存在
  Key: key,
  // 上传文件路径
  FilePath: localFile,
  // 表示文件大小超出一个数值时使用分块上传
  SliceSize: 1024 * 1024 * 3,
}
let result = {}
// 上传任务的回调
let taskStatus = ""
// 上传进度的对象
let onHashProgress = {}
let onProgress = {}
cos.sliceUploadFile({
  ...params,
  // 上传任务创建时的回调函数，返回一个 taskId，
  // 唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）
  onTaskReady: (taskId) => {
    taskStatus = taskId
  },
  // 计算文件 MD5 值的进度回调函数，回调参数为进度对象 progressData
  onHashProgress: (progressData) => {
    onHashProgress = progressData
  },
  // 上传文件的进度回调函数，回调参数为进度对象 progressData
  onProgress: (progressData) => {
    onProgress = progressData
  }
}, async (err, data) => {
  try {
    if (err) {
      return res.send(R.fail("图片上传失败."))
    } else {
      // 首先删除上传到本地的文件
      fs.unlinkSync(localFile)
      // 保存图片信息到相关表格中
      result = {
        taskStatus,
        onHashProgress: onHashProgress,
        onProgress: onProgress
      }
      console.log("data", data)
    }
  } catch (error) {
    return res.send(R.fail("图片上传失败."))
  }
})
```

具体参数说明以及需要什么格式的参数，请查看[官方文档(https://cloud.tencent.com/document/product/436/64980)]

之后运行一下这个接口，然后发送请求：

![对象存储9](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A89.png)

然后去`node-serve/port-map/`文件夹下查看是否存在该图片：

![对象存储10](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A810.png)

这下对象存储就成功了，当涉及到数据库的时候，直接将返回的`Location`保存在数据库相关字段中，前端请求就可以获取到相应的图片了。

![对象存储11](https://bugdr-project-1305152720.cos.ap-beijing.myqcloud.com/code-images/%E5%AF%B9%E8%B1%A1%E5%AD%98%E5%82%A811.png)