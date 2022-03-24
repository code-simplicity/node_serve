const express = require("express");

const router = express.Router();
const {
    Op
} = require("sequelize");

// 加密库
const CryptoJS = require("crypto-js")

// 导入暴露的模型
const UserModel = require("../../models/UserModel");

const jwtUtils = require("../../utils/jwtUtils");

const Constants = require("../../utils/Constants")

const utils = require("../../utils/utils");

const R = require("../../utils/R")

const redis = require("../../config/redis")


/**
 * @api {post} /portal/user/add 用户注册接口
 * @apiDescription 用户注册接口
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} user_name="杜培义" 姓名
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} sex="男" 性别
 * @apiBody  {String} email="" 邮箱
 * @apiBody  {String} emailCode="" 邮箱验证码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/add
 * @apiVersion 1.0.0
 */
router.post("/user/add", async (req, res) => {
    // 用户名，密码，学号，性别，邮箱地址
    let {
        id,
        user_name,
        password,
        sex,
        email,
        emailCode
    } = req.body
    if (utils.isEmpty(id)) {
        return res.send(R.fail("注册学号不可以为空."))
    }
    if (utils.isEmpty(user_name)) {
        return res.send(R.fail("姓名不可以为空."))
    }
    if (utils.isEmpty(password)) {
        return res.send(R.fail("密码不可以为空."))
    }
    if (utils.isEmpty(sex)) {
        return res.send(R.fail("性别不可以为空."))
    }
    if (utils.isEmpty(email)) {
        return res.send(R.fail("邮箱不可以为空."))
    }
    // 检验邮箱验证码
    const emailCodeRecord = await redis.getString(Constants.User.EMAIL_CODE + email)
    if (utils.isEmpty(emailCodeRecord) || emailCodeRecord !== emailCode) {
        return res.send(R.fail("邮箱验证码不正确."))
    }
    // 判断密码是否通过crypto进行摘要计算，32位
    if (password.length !== 32) {
        return res.send(R.fail("请使用Crypto进行加密"))
    }
    // 查看邮箱是否被注册
    const userEmail = await UserModel.findOne({
        where: {
            email: email
        }
    })
    // 存在邮箱
    if (userEmail !== null) {
        return res.send(R.fail("该邮箱已经被注册."))
    }
    // 判断学号是否被注册
    const userId = await UserModel.findOne({
        where: {
            id: id,
        },
    })
    if (userId !== null) {
        return res.send(R.fail("该学号已经被注册，请联系管理员老师."))
    }
    // 对密码进行加密入库
    password = CryptoJS.DES.encrypt(password, Constants.User.PASSWORD_MESSAGE).toString()
    // 解密
    // const bytes = CryptoJS.DES.decrypt(password, Constants.User.PASSWORD_MESSAGE)
    // console.log(bytes.toString(CryptoJS.enc.Utf8))
    // 保存信息，入库
    await UserModel.create({
        id,
        user_name,
        password,
        sex,
        email,
    })
    // 返回结果
    return res.send(R.success({}, "添加用户成功."))
});

/**
 * @api {post} /portal/user/login 用户登录接口
 * @apiDescription 用户登录接口
 * @apiName 门户
 * @apiGroup PortalUser
 * @apiBody  {String} id="1807010210" 学号
 * @apiBody  {String} password="123456" 密码
 * @apiBody  {String} email="" 邮箱
 * @apiBody  {String} emailCode="" 邮箱验证码
 * @apiSuccess {json} result
 * @apiSampleRequest http://localhost:5050/portal/user/login
 * @apiVersion 1.0.0
 */
router.post("/user/login", async (req, res) => {
    // 登录可以使用学号+密码或者邮箱+密码
    const loginVo = req.body

})

module.exports = router