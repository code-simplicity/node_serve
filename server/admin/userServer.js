const UserModel = require("../../models/UserModel")
const userServer = {

    /**
     * 返回用户信息
     * @param {*} id 
     * @returns 
     */
    async login(id) {
        const result = await UserModel.findOne({
            where: {
                id
            }
        })
        return result
    },

    /**
     * 获取用户信息
     * @param {*} id 
     * @returns 
     */
    async getUserInfo(id) {
        const result = await UserModel.findOne({
            where: {
                id
            }
        })
        return result
    }
}
module.exports = userServer