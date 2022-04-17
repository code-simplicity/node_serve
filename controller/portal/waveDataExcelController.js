const waveDataExcelServer = require("../../server/portal/waveDataExcelServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const waveDataExcelController = {

    /**
     * 获取在线的excel
     * @param {*} args 
     * @param {*} res 
     */
    async getWaveDataExcelByPortMapPointId(args, res) {
        try {
            const {
                port_point_map_id
            } = args
            if (utils.isEmpty(port_point_map_id)) {
                return res.status(resCode.UnprocessableEntity.code).send(new FailModel("port_point_map_id不可以为空"))
            }
            const {
                dataValues
            } = await waveDataExcelServer.getWaveDataExcelByPortMapPointId(port_point_map_id)
            if (dataValues !== null) {
                return res.send(new SuccessModel(dataValues, "获取港口点位excel数据成功"))
            } else {
                return res.send(new FailModel("获取港口点位excel数据失败"))
            }
        } catch (error) {
            return res.send(new FailModel("获取港口点位excel数据失败"))
        }
    }
}

module.exports = waveDataExcelController