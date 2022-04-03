const {
    Op
} = require("sequelize");
const PointModel = require("../../models/PointModel")
const pointServer = {

    /**
     * 批量创建点位
     * @param {*} args 
     * @returns 
     */
    async addPoint(args) {
        const result = await PointModel.bulkCreate(args)
        return result
    },

    /**
     * 获取所有点位
     */
    async getPointFindAll() {
        const result = await PointModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 删除点位
     * @param {*} id 
     */
    async deletePoint(id) {
        const result = await PointModel.destroy({
            where: {
                id
            },
        })
        return result
    },

    /**
     * 更新点位
     * @param {*} args 
     */
    async updatePoint(args) {
        const result = await PointModel.update(args, {
            where: {
                id: args.id,
            },
        })
        return result
    },

    /**
     * 
     * @param {*} args 
     */
    async searchPoint(args) {
        const {
            port_point_map_id,
            content
        } = args
        const result = await PointModel.findAll({
            where: {
                [Op.or]: [{
                        port_point_map_id: port_point_map_id ? port_point_map_id : "",
                    },
                    {
                        content: content ? content : "",
                    },
                ],
            },
            order: [
                ["content"]
            ],
        })
        return result
    },

    /**
     * 批量删除点位
     * @param {*} pointIds 
     */
    async batchDeletePoint(pointIds) {
        const result = await PointModel.destroy({
            where: {
                id: {
                    [Op.in]: pointIds,
                },
            },
        })
        return result
    }
}
module.exports = pointServer