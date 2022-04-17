const bimModel = require("../../models/BimModel")
const {
    Op
} = require("sequelize")
const bimServer = {

    /**
     * 上传三维模型file
     * @param {*} args 
     */
    async uploadBim(args) {
        const {
            url,
            path,
            type,
            name
        } = args
        const result = await bimModel.create({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
        })
        return result
    },

    /**
     * 获取全部三维模型
     */
    async bimFindAll() {
        const result = await bimModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 更新三维模型
     * @param {*} args 
     */
    async updateBim(args) {
        const {
            id,
            url,
            path,
            type,
            name
        } = args
        const result = await bimModel.update({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name
        }, {
            where: {
                id,
            },
        })
        return result
    },

    /**
     * 删除港口点位统计结果excel
     * @param {*} id 
     */
    async deleteBim(id) {
        const result = await bimModel.destroy({
            where: {
                id,
            }
        })
        return result
    },

    /**
     * 批量删除三维模型
     * @param {*} bimIds 
     */
    async batchDeleteBim(bimIds) {
        const result = await bimModel.destroy({
            where: {
                id: {
                    [Op.in]: bimIds,
                },
            },
        })
        return result
    },
}
module.exports = bimServer