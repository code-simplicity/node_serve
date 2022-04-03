const {
    Op
} = require("sequelize")
const PortPointMapModel = require("../../models/PortPointMapModel")
const portPointMapServer = {

    /**
     * 上传港口点位
     * @param {*} args 
     */
    async uploadPortPointMap(args) {
        const {
            url,
            path,
            type,
            name,
            water_level,
            wave_direction,
            embank_ment
        } = args
        const result = await PortPointMapModel.create({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment,
        })
        return result
    },

    /**
     * 获取所有视频
     */
    async getPortPointMapFindAll() {
        const result = await PortPointMapModel.findAll({
            order: [
                ["create_time"]
            ],
        });
        return result
    },

    /**
     * 更新港口点位地图
     * @param {*} args 
     */
    async updatePortPointMap(args) {
        const {
            id,
            url,
            path,
            type,
            name,
            water_level,
            wave_direction,
            embank_ment
        } = args
        const result = await PortPointMapModel.update({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment,
        }, {
            where: {
                id,
            },
        })
        return result
    },

    /**
     * 删除港口点位地图
     * @param {*} id 
     */
    async deletePortPointMap(id) {
        const result = await PortPointMapModel.destroy({
            where: {
                id,
            }
        })
        return result
    },

    /**
     * 模糊获取港口点位地图
     * @param {*} args 
     */
    async searchPortPointMap(args) {
        const {
            water_level,
            wave_direction,
            embank_ment,
        } = args
        const result = await PortPointMapModel.findAll({
            where: {
                [Op.or]: [{
                        water_level: water_level ? water_level : "",
                    },
                    {
                        wave_direction: wave_direction ? wave_direction : "",
                    },
                    {
                        embank_ment: embank_ment ? embank_ment : "",
                    },
                ],
            },
        })
        return result
    },

    /**
     * 批量删除
     * @param {*} portpointmapIds 
     */
    async batchDeletePortPointMap(portpointmapIds) {
        const result = await PortPointMapModel.destroy({
            where: {
                id: {
                    [Op.in]: portpointmapIds,
                },
            },
        })
        return result
    }
}
module.exports = portPointMapServer