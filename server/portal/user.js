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
        console.log(result)
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
    }
}

module.exports = user