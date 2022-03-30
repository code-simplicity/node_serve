const waveformsServer = require("../../server/portal/waveforms")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");

const waveforms = {
    async waveFormsByPointIdFindOne(args, res) {
        try {
            const {
                point_id
            } = args
            if (!point_id) {
                return res.send(new FailModel("point_id不能为空"))
            }
            const {
                dataValues
            } = await waveformsServer.waveFormsByPointIdFindOne(point_id)
            if (dataValues !== null) {
                return res.send(new SuccessModel(dataValues, "查询波形图成功"))
            } else {
                return res.send(new FailModel("查询波形图失败"))
            }
        } catch (error) {
            return res.send(new FailModel("查询波形图失败"))
        }
    }
}
module.exports = waveforms