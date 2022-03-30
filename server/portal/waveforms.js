const WaveFormsModel = require("../../models/WaveFormsModel")
const waveforms = {

    /**
     * 根据点位图id查询波形图
     * @param {*} point_id 
     * @returns 
     */
    async waveFormsByPointIdFindOne(point_id) {
        const result = await WaveFormsModel.findOne({
            where: {
                point_id,
            },
        })
        return result
    }

}

module.exports = waveforms