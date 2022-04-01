const userServer = require("../../server/admin/userServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const redis = require("../../config/redis")
const refreshTokenServer = require("../../server/portal/refreshToken")
const userController = {

    /**
     * 登录
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     */
    async login(args, req, res) {
        try {
            let {
                id,
                password,
                captcha,
                from
            } = args
            // 判断用户从哪个平台进入的
            if (utils.isEmpty(from) || Constants.App.FROM_PC !== from) {
                from = Constants.App.FROM_PC
            }
            // 从cookie中获取captcha的key
            const captchaKey = utils.getCookieKey(req.cookies, Constants.User.LAST_CAPTCHA_ID)
            // 通过key从redis中读取相关的机器验证码的值
            const captchaValue = await redis.getString(Constants.User.CAPTCHA_CONTENT + captchaKey)
            if (captcha !== captchaValue) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("图灵验证码不正确"))
            }
            // 验证成功之后，删除redis的验证码
            redis.delString(Constants.User.CAPTCHA_CONTENT + captchaKey)
            if (utils.isEmpty(id)) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
            }
            if (utils.isEmpty(password)) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不可以为空"))
            }
            if (password.length !== 32) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请使用MD5摘要加密"))
            }
            // 查询用户是否有
            const {
                dataValues
            } = await userServer.login(id)
            if (dataValues === null) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("用户名或者密码不正确"))
            }
            // 对比密码输入是否一致，首先对密码进行解密
            const desPassword = utils.desDecrypt(dataValues.password, Constants.User.PASSWORD_MESSAGE)
            if (password !== desPassword) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不正确"))
            }
            // 判断用户是否是管理员
            if (dataValues.roles !== "admin") {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("没有权限登录"))
            }
            // 这回创建token
            const tokenKey = await utils.createToken(req, dataValues, from)
            utils.setCookieKey(res, Constants.User.USER_COOKIE_DATA, tokenKey, Constants.TimeSecound.DAY)
            utils.delCookieKey(res, Constants.User.LAST_CAPTCHA_ID)
            // 将这个tokenKey和id返回给前端，之后前端将这个tokenKey保存，然后通过设置在headers.authorization来验证码接口
            const tokenKeyValue = `Bearer,${tokenKey}`
            const {
                user_name,
                sex,
                score,
                email,
                roles
            } = dataValues
            return res.send(new SuccessModel({
                tokenKey: tokenKeyValue,
                id,
                user_name,
                sex,
                score,
                email,
                roles
            }, "管理员登录成功"))
        } catch (error) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("登录失败，请检查重试"))
        }
    },

    /**
     * 获取用户信息
     * @param {*} args 
     * @param {*} res 
     */
    async getUserInfo(args, res) {
        const {
            id
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        const {
            dataValues
        } = await userServer.getUserInfo(id)
        const {
            password,
            ...data
        } = dataValues
        if (dataValues !== null) {
            return res.send(new SuccessModel(data, "获取用户信息成功"))
        } else {
            return res.send(new FailModel("获取用户信息失败"))
        }
    },

    /**
     * 退出登录
     * @param {*} req 
     * @param {*} res 
     */
    async logout(req, res) {
        // 首先拿到tokenKey
        const tokenKey = utils.getCookieKey(req.cookies, Constants.User.USER_COOKIE_DATA)
        // 判断tokenKey是否存在
        if (utils.isEmpty(tokenKey)) {
            return res.send(new FailModel("账户未登录"))
        }
        // 删除redis中的tokenKey
        redis.delString(Constants.User.TOKEN_KEY + tokenKey)
        // 删除mysql中的refreshtoken
        await refreshTokenServer.updateRefreshToken(tokenKey)
        // 删除cookie中的tokenKey
        utils.delCookieKey(res, Constants.User.USER_COOKIE_DATA)
        return res.send(new SuccessModel("管理员退出登录成功"))
    },

    /**
     * 获取用户列表
     * @param {*} args 
     * @param {*} res 
     */
    async getUserList(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        // 首先判断pageNum和pageSize不为空
        if (utils.isEmpty(pageNum) && utils.isEmpty(pageSize)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("页码和页数不能为空"))
        }
        const result = await userServer.getUserList()
        if (result !== null) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取用户列表成功"))
        } else {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("获取用户列表失败"))
        }
    },

    /**
     * 根据用户名，学号支持模糊搜索
     * @param {*} args 
     * @param {*} res 
     */
    async getUserListSearch(args, res) {
        const {
            user,
            pageNum,
            pageSize,
        } = args
        if (utils.isEmpty(pageNum) && utils.isEmpty(pageSize)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("页码和页数不能为空"))
        }
        if (utils.isEmpty(user)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("学号/用户名不可以为空"))
        }
        const result = await userServer.getUserListSearch(user)
        if (result !== null) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "搜索用户列表成功"))
        } else {
            return res.send(new FailModel("搜索用户失败"))
        }
    },

    /**
     * 添加用户
     * @param {*} args 
     * @param {*} res 
     */
    async addUser(args, res) {
        // 读取请求参数,邮箱不是必填
        let {
            id,
            user_name,
            password,
            roles,
            state,
            sex,
            email,
            score
        } = args;
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("学号不可以为空"))
        }
        if (utils.isEmpty(user_name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("姓名不可以为空"))
        }
        if (utils.isEmpty(password)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("密码不可以为空"))
        }
        if (utils.isEmpty(roles)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("角色不可以为空"))
        }
        if (utils.isEmpty(state)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("状态不可以为空"))
        }
        if (utils.isEmpty(sex)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("性别不可以为空"))
        }
        if (utils.isEmpty(score)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("得分不可以为空"))
        }
        // 判断密码是否通过crypto进行摘要计算，32位
        if (password.length !== 32) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请使用MD5进行摘要计算"))
        }
        // 对密码进行加密入库，前端首先是通过md5，过来再转一下
        password = utils.desEncrypt(password, Constants.User.PASSWORD_MESSAGE)
        // 根据id查询用户是否存在
        const result = await userServer.getUserInfo(id)
        if (result !== null) {
            return res.send(new FailModel("该用户已经存在"))
        } else {
            // 添加用户
            const params = {
                id,
                user_name,
                password,
                sex,
                email,
                roles,
                state,
                score
            }
            const {
                dataValues
            } = await userServer.addUser(params)
            if (dataValues !== null) {
                return res.send(new SuccessModel("添加用户成功"))
            } else {
                return res.send(new FailModel("添加用户失败"))
            }
        }
    },

    /**
     * 更新用户信息
     * @param {*} args 
     * @param {*} res 
     */
    async updateUser(args, res) {
        let {
            id,
            user_name,
            password,
            roles,
            stats,
            sex,
            email
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("学号不可以为空"))
        }
        if (password.length !== 32) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请使用MD5进行加密"))
        }
        password = utils.desEncrypt(password, Constants.User.PASSWORD_MESSAGE)
        const params = {
            id,
            user_name,
            password,
            roles,
            stats,
            sex,
            email
        }
        const [result] = await userServer.updateUser(params)
        if (result) {
            return res.send(new SuccessModel("用户信息修改成功"))
        } else {
            return res.send(new FailModel("用户信息修改失败"))
        }
    },

    /**
     * 删除用户
     * @param {*} args 
     * @param {*} res 
     */
    async deleteUser(args, res) {
        const {
            id
        } = args
        // 首先判断id不可以为空
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("学号不可以为空"))
        }
        const result = await userServer.deleteUser(id)
        if (result) {
            return res.send(new SuccessModel("删除用户成功"))
        } else {
            return res.send(new FailModel("删除用户失败"))
        }
    },

    /**
     * 批量删除
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteUser(args, res) {
        const {
            ids
        } = args
        if (ids.length <= 0) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("ids不能为空"))
        }
        const result = await userServer.batchDeleteUser(ids)
        if (result) {
            return res.send(new SuccessModel("批量删除成功"))
        } else {
            return res.send(new FailModel("批量删除失败"))
        }
    },

    /**
     * 重置学号
     * @param {*} args 
     * @param {*} res 
     */
    async resetUserId(args, res) {
        const {
            oldId,
            newId
        } = args
        if (utils.isEmpty(oldId)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("旧学号不可以为空"))
        }
        if (utils.isEmpty(newId)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("新学号不可以为空"))
        }
        const [result] = await userServer.resetUserId(args)
        if (result) {
            return res.send(new SuccessModel("重置学号成功"))
        } else {
            return res.send(new FailModel("重置学号失败"))
        }
    }
}

module.exports = userController