const portPointMapServer = require("../../server/portal/portpointmap")

const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");

const portpointmap = {
    /**
     * 获取港口点位地图
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async portPointMapFindOne(args, res) {
        const {
            water_level,
            wave_direction,
            embank_ment,
        } = args
        if (!water_level) {
            return res.send(new FailModel("water_level不能为空"))
        }
        if (!wave_direction) {
            return res.send(new FailModel("wave_direction不能为空"))
        }
        if (!embank_ment) {
            return res.send(new FailModel("embank_ment不能为空"))
        }
        const {
            dataValues
        } = await portPointMapServer.portPointMapFindOne(args)
        if (dataValues !== null) {
            return res.send(new SuccessModel(dataValues, "获取港口点位地图成功"))
        } else {
            return res.send(new FailModel("获取港口点位地图失败"))
        }
    }
}

module.exports = portpointmap