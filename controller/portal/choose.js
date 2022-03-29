const chooseServer = require("../../server/portal/choose")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const choose = {

    /**
     * 获取所有内容
     * @param {*} args 
     * @param {*} res 
     */
    async chooseFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await chooseServer.chooseFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "选择获取成功"))
        } else {
            return res.send(new FailModel("没有任何内容"))
        }
    },
}

module.exports = choose