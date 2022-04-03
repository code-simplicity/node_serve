const {
    Op
} = require("sequelize")
const WaveStatsModel = require("../../models/WaveStatsModel")
const waveStatsServer = {
    /**
     * 上传波形统计图
     * @param {*} args 
     */
    async uploadWaveStats(args) {
        const {
            point_id,
            url,
            path,
            type,
            name
        } = args
        const result = await WaveStatsModel.create({
            point_id: point_id,
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
        })
        return result
    },

    /**
     * 获取所有波形统计图
     */
    async waveStatsFindAll() {
        const result = await WaveStatsModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 修改波形统计图
     * @param {*} args 
     */
    async updateWaveStats(args) {
        const {
            id,
            point_id,
            url,
            path,
            type,
            name
        } = args
        const result = await WaveStatsModel.update({
            point_id: point_id,
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
     * 删除波形图
     * @param {*} id 
     */
    async deleteWaveStats(id) {
        const result = await WaveStatsModel.destroy({
            where: {
                id,
            }
        })
        return result
    },

    /**
     * 查找港口地图下所有的波形图
     * @param {*} pointIds 
     */
    async findAllWaveStatsPointIds(pointIds) {
        const result = await WaveStatsModel.findAll({
            where: {
                point_id: {
                    [Op.or]: pointIds
                }
            }
        })
        return result
    },

    /**
     * 批量删除波形图
     * @param {*} wavestatsIds 
     */
    async batchDeleteWaveStats(wavestatsIds) {
        const result = await WaveStatsModel.destroy({
            where: {
                id: {
                    [Op.in]: wavestatsIds,
                },
            },
        })
        return result
    }
}
module.exports = waveStatsServer