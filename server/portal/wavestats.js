const WaveStatsModel = require("../../models/WaveStatsModel")
const wavestats = {

    /**
     * 根据点位图id查询波形统计图
     * @param {*} point_id 
     * @returns 
     */
    async wavestatsByPointIdFindOne(point_id) {
        const result = await WaveStatsModel.findOne({
            where: {
                point_id,
            },
        })
        return result
    }

}

module.exports = wavestats