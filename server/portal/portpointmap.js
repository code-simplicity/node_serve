const {
    Op
} = require("sequelize")
const PortPointMapModel = require("../../models/PortPointMapModel")
const portPointMap = {

    /**
     * 获取通过设计水位等回去港口点位地图
     * @param {*} args 
     * @returns 
     */
    async portPointMapFindOne(args) {
        const {
            water_level,
            wave_direction,
            embank_ment,
        } = args
        const result = await PortPointMapModel.findOne({
            where: {
                [Op.and]: [{
                        water_level: water_level,
                    },
                    {
                        wave_direction: wave_direction,
                    },
                    {
                        embank_ment: embank_ment,
                    },
                ],
            },
        })
        return result
    }
}

module.exports = portPointMap