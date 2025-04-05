const contentServer = require("../../server/portal/content")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const content = {

    /**
     * 获取所有内容
     * @param {*} args 
     * @param {*} req 
     * @param {*} res 
     */
    async contentFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await contentServer.contentFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "内容获取成功"))
        } else {
            return res.send(new FailModel("没有任何内容"))
        }
    },

    async contentByChooseId(args, res) {
        const {
            choose_id
        } = args
        const {
            dataValues
        } = await contentServer.getContentByChooseId(choose_id) || {}
        if (dataValues !== null) {
            return res.send(new SuccessModel(dataValues, "内容获取成功"))
        } else {
            return res.send(new FailModel("没有任何内容"))
        }
    }
}

module.exports = content