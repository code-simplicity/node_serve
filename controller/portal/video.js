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
}

module.exports = video