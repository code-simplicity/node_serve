const {
    Op
} = require("sequelize")
const WaveFormsModel = require("../../models/WaveFormsModel")
const waveFormsServer = {

    /**
     * 上传波形统计图
     * @param {*} args 
     */
    async uploadWaveForms(args) {
        const {
            point_id,
            url,
            path,
            type,
            name
        } = args
        const result = await WaveFormsModel.create({
            point_id: point_id,
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
        })
        return result
    },

    /**
     * 获取所有波形图
     */
    async waveFormsFindAll() {
        const result = await WaveFormsModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 修改波形图
     * @param {*} args 
     */
    async updateWaveForms(args) {
        const {
            id,
            point_id,
            url,
            path,
            type,
            name
        } = args
        const result = await WaveFormsModel.update({
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
    async deleteWaveForms(id) {
        const result = await WaveFormsModel.destroy({
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
    async findAllWaveFormsPointIds(pointIds) {
        const result = await WaveFormsModel.findAll({
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
     * @param {*} waveformsIds 
     */
    async batchDeleteWaveForms(waveformsIds) {
        const result = await WaveFormsModel.destroy({
            where: {
                id: {
                    [Op.in]: waveformsIds,
                },
            },
        })
        return result
    }
}
module.exports = waveFormsServer