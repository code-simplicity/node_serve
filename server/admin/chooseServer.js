const {
    Op
} = require("sequelize")
const ChooseModel = require("../../models/ChooseModel")
const chooseServer = {

    /**
     * 添加内容
     * @param {*} args 
     * @returns 
     */
    async addChoose(args) {
        const result = await ChooseModel.create({
            ...args
        })
        return result
    },

    /**
     * 获取所有选择
     * @returns 
     */
    async getChooseFindAll() {
        const result = await ChooseModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 修改内容
     * @param {*} args 
     */
    async updateChoose(args) {
        const {
            id,
            content,
            category
        } = args
        const result = await ChooseModel.update({
            content,
            category
        }, {
            where: {
                id
            }
        })
        return result
    },

    /**
     * 删除选择
     * @param {*} id 
     * @returns 
     */
    async deleteChoose(id) {
        const result = await ChooseModel.destroy({
            where: {
                id
            }
        })
        return result
    },

    /**
     * 批量删选择
     * @param {*} ids 
     * @returns 
     */
    async batchDeleteChoose(ids) {
        const result = await ChooseModel.destroy({
            where: {
                id: {
                    [Op.in]: ids,

                }
            }
        })
        return result
    }
}
module.exports = chooseServer