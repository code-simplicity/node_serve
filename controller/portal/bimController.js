const bimServer = require("../../server/portal/bimServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const utils = require("../../utils/utils");

const bimController = {

    /**
     * 门户获取港bim
     * @param {*} args 
     * @param {*} res 
     */
    async getBimFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await bimServer.getBimFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取bim成功"))
        } else {
            return res.send(new FailModel("获取bim失败"))
        }
    }
}

module.exports = bimController