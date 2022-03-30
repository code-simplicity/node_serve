const videoServer = require("../../server/portal/video")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const video = {

    /**
     * 获取所有内容
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     */
    async videoFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await videoServer.videoFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "视频获取成功"))
        } else {
            return res.send(new FailModel("没有任何内容"))
        }
    },

    /**
     * 获取观看视频
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async videoSearchFindOne(args, res) {
        try {
            const {
                water_level,
                wave_direction,
                embank_ment
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
            const params = {
                water_level,
                wave_direction,
                embank_ment
            }
            const {
                dataValues
            } = await videoServer.videoSearchFindOne(params)
            if (dataValues !== null) {
                return res.send(new SuccessModel(dataValues, "获取观看视频成功"))
            } else {
                return res.send(new FailModel("获取观看视频失败"))
            }
        } catch (error) {
            return res.send(new FailModel("获取观看视频失败"))
        }
    }
}

module.exports = video