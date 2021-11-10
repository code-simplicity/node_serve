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

