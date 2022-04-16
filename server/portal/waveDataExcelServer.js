const waveDataExcelModel = require("../../models/waveDataExcelModel")
const waveDataExcelServer = {

    /**
     * 门户获取港口点位分析excel的信息
     * @param {*} port_point_map_id 
     * @returns 
     */
    async getWaveDataExcelByPortMapPointId(port_point_map_id) {
        const result = await waveDataExcelModel.findOne({
            where: {
                port_point_map_id,
            },
        })
        return result
    }
}

module.exports = waveDataExcelServer