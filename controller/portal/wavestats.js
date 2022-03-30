const wavestatsServer = require("../../server/portal/wavestats")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");

const wavestats = {
    async wavestatsByPointIdFindOne(args, res) {
        try {
            const {
                point_id
            } = args
            if (!point_id) {
                return res.send(new FailModel("point_id不能为空"))
            }
            const {
                dataValues
            } = await wavestatsServer.wavestatsByPointIdFindOne(point_id)
            if (dataValues !== null) {
                return res.send(new SuccessModel(dataValues, "查询波形统计图成功"))
            } else {
                return res.send(new FailModel("查询波形统计图失败"))
            }
        } catch (error) {
            return res.send(new FailModel("查询波形统计图失败"))
        }
    }
}
module.exports = wavestats