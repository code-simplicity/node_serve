const {
    Op
} = require("sequelize")
const PointModel = require("../../models/PointModel")

const point = {

    /**
     * 根据港口点位地图id查找港口定位图
     * @param {*} args 
     */
    async getPointByPointMapIdFindAll(args) {
        const {
            port_point_map_id,
            content
        } = args
        const result = await PointModel.findAll({
            where: {
                port_point_map_id: port_point_map_id
            },
            // 按照点位值的内容进行升序.
            order: [
                ["content"]
            ],
        })
        return result
    }
}
module.exports = point