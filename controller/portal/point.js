const pointServer = require("../../server/portal/point")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const utils = require("../../utils/utils");
const point = {
    async getPointByPointMapIdFindAll(args, res) {
        const {
            pageNum,
            pageSize,
            port_point_map_id,
            content
        } = args
        const params = {
            port_point_map_id,
            content
        }
        const result = await pointServer.getPointByPointMapIdFindAll(params)
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询点位成功"))
        } else {
            return res.send(new FailModel("查询点位失败"))
        }

    }
}

module.exports = point