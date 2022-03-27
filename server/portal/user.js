const UserModel = require("../../models/UserModel")

const user = {
    // 用户注册
    async register(args) {
        const {
            id,
            user_name,
            password,
            sex,
            email
        } = args
        const result = await UserModel.create({
            id,
            user_name,
            password,
            sex,
            email,
        })
        return result
    },

    // 获取用户信息
    async getUserInfo(id) {
        const result = await UserModel.findOne({
            where: {
                id
            }
        })
        return result
    },

    // 查看邮箱是否注册
    async checkEmail(email) {
        const result = await UserModel.findOne({
            where: {
                email
            }
        })
        return result
    },

    /**
     * 更新用户信息
     * @param {*} args 
     * @returns 
     */
    async updateUserInfo(args) {
        const {
            id,
            ...data
        } = args
        const result = await UserModel.update(data, {
            where: {
                id
            }
        })
        return result
    },

    /**
     * 重置密码
     * @param {*} args 
     * @returns 
     */
    async resetPassWord(args) {
        const {
            id,
            password
        } = args
        const result = await UserModel.update({
            password: password
        }, {
            where: {
                id
            }
        })
        return result
    },

    /**
     * 用户添加得分
     * @param {*} args 
     * @returns 
     */
    async addUserScore(args) {
        const {
            id,
            score
        } = args
        const result = await UserModel.update({
            score: score
        }, {
            where: {
                id
            }
        })
        return result
    },

    /**
     * 更新邮箱
     * @param {*} args 
     * @returns 
     */
    async updateUserEmail(args) {
        const {
            id,
            email
        } = args
        const result = await UserModel.update({
            email
        }, {
            where: {
                id
            }
        })
        return result
    }
}

module.exports = user