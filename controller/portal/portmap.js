const portMapServer = require("../../server/portal/portmap")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");

const portMap = {
    /**
     * 获取港口地图
     * @param {*} args 
     * @param {*} res 
     */
    async portMapFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await portMapServer.portMapFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "港口地图获取成功"))
        } else {
            return res.send(new FailModel("没有任何地图"))
        }
    }
}

module.exports = portMap