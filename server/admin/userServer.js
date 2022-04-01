const {
    Op
} = require("sequelize")
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
    },

    /**
     * 获取所有的用户列表
     * @returns 
     */
    async getUserList() {
        const result = await UserModel.findAll({
            order: [
                ["create_time"]
            ]
        })
        return result
    },

    /**
     * 根据id或者用户名模糊搜索
     * @param {*} args 
     */
    async getUserListSearch(args) {
        const result = await UserModel.findAll({
            where: {
                [Op.or]: [{
                        id: {
                            [Op.like]: `%${args}%`,
                        },
                    },
                    {
                        user_name: {
                            [Op.like]: `%${args}%`,
                        },
                    },
                ],
            },
        })
        return result
    },

    /**
     * 添加用户
     * @param {*} args 
     */
    async addUser(args) {
        const result = await UserModel.create({
            ...args
        })
        return result
    },

    /**
     * 修改用户信息,包括重置学号
     * @param {*} args 
     */
    async updateUser(args) {
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
     * 删除用户
     * @param {用户id} id 
     * @returns 
     */
    async deleteUser(id) {
        const result = await UserModel.destroy({
            where: {
                id
            }
        })
        return result
    },

    /**
     * 批量删除用户
     * @param {*} ids [] 
     * @returns 
     */
    async batchDeleteUser(ids) {
        const result = await UserModel.destroy({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
        })
        return result
    },

    /**
     * 重置学号
     * @param {*} args 
     * @returns 
     */
    async resetUserId(args) {
        const {
            oldId,
            newId
        } = args
        const result = await UserModel.update({
            id: newId
        }, {
            where: {
                id: oldId
            }
        })
        return result
    }
}
module.exports = userServer