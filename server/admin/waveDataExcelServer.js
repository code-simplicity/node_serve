const waveDataExcelModel = require("../../models/waveDataExcelModel")
const {
    Op
} = require("sequelize")
const waveDataExcelServer = {

    /**
     * 上传波形excel数据
     * @param {*} args 
     */
    async uploadWaveDataExcel(args) {
        const {
            port_point_map_id,
            url,
            path,
            type,
            name
        } = args
        const result = await waveDataExcelModel.create({
            port_point_map_id: port_point_map_id,
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
        })
        return result
    },

    /**
     * 获取全部港口点位统计结果excel
     */
    async waveDataExcelFindAll() {
        const result = await waveDataExcelModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 更新港口点位统计结果excel
     * @param {*} args 
     */
    async updateWaveDataExcel(args) {
        const {
            id,
            port_point_map_id,
            url,
            path,
            type,
            name
        } = args
        const result = await waveDataExcelModel.update({
            port_point_map_id: port_point_map_id,
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
    async deleteWaveDataExcel(id) {
        const result = await waveDataExcelModel.destroy({
            where: {
                id,
            }
        })
        return result
    },

    /**
     * 批量删除
     * @param {*} waveDataExcelIds 
     */
    async batchDeleteWaveDataExcel(waveDataExcelIds) {
        const result = await waveDataExcelModel.destroy({
            where: {
                id: {
                    [Op.in]: waveDataExcelIds,
                },
            },
        })
        return result
    }
}
module.exports = waveDataExcelServer