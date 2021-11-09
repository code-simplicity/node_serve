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
npm start
```

使用浏览器打开，或者使用postman接口测试工具进行连接测试

## 1、登录请求

### 请求URL地址

```shell
http://localhost:5000/login
```

### 请求方式

```shell
POST
```

### 请求参数

```shell
|参数		|是否必选      |类型      |说明
|user_name    |Y        |string    |用户名
|password     |Y        |string    |密码
```

### 返回示例：

```json
{
    "state": 200,
    "msg": "登录成功.",
    "data": {
        "id": "123",
        "user_name": "py",
        "sex": "男",
        "password": "123456",
        "roles": "role_admin",
        "create_time": "2021-11-09T00:00:00.000Z",
        "update_time": "2021-11-09T00:00:00.000Z"
    }
}
```

## 2、添加用户

### 请求URL地址

```shell
http://localhost:5000/user/add
```

### 请求方式

```shell
POST
```

### 请求参数

```shell
|参数		|是否必选      |类型      |说明
|id    |Y        |string    |学号
|user_name    |Y        |string    |用户名
|password     |Y        |string    |密码
|sex    |Y        |string    |性别
|roles     |Y        |string    |角色
```

### 返回示例：

```js
{
    "status": 200,
    "msg": "添加用户成功.",
    "data": {
        "create_time": 1636462924117,
        "update_time": 1636462924117,
        "id": "04",
        "user_name": "1py",
        "sex": "男",
        "password": "123456",
        "roles": "admin"
    }
}
```

## 3、删除用户

### 请求URL地址

```shell
http://localhost:5000/user/delete
```

### 请求方式

```shell
POST
```

### 请求参数

```shell
|参数		|是否必选      |类型      |说明
|id    |Y        |string    |学号
```

### 返回示例：

```js
{
    "status": 200,
    "msg": "删除用户成功."
}
```

