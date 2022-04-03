const pointServer = require("../../server/admin/pointServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");

const pointController = {

    /**
     * 添加点位
     * @param {*} args 
     * @param {*} res 
     */
    async addPoint(args, res) {
        const {
            port_point_map_id,
            content
        } = args;
        if (utils.isEmpty(port_point_map_id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("港口点位图id不可以为空"))
        }
        if (utils.isEmpty(content)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("点位内容不可以为空"))
        }
        // 这里对输入的content做一个封装，一般我们将content设置为39，
        // 然后通过循环键这些值组装成{port_point_map_id：port_point_map_id, content: 1-39}这种形式
        let obj = {}
        let array = []
        let i = 1
        while (i <= Number(content)) {
            obj = {
                port_point_map_id: port_point_map_id,
                content: i
            }
            array.push(obj)
            i++
        }
        const result = await pointServer.addPoint(array)
        if (result.length > 0) {
            return res.send(new SuccessModel(`成功在${port_point_map_id}点位图上添加${content}个点位`))
        } else {
            return res.send(new FailModel("点位添加失败"))
        }
    },

    /**
     * 获取所有点位表
     * @param {*} args 
     * @param {*} res 
     */
    async getPointFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args;
        const result = await pointServer.getPointFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取所有点位成功"))
        } else {
            return res.send(new FailModel("获取所有点位失败"))
        }
    },

    /**
     * 删除点位
     * @param {*} args 
     * @param {*} res 
     */
    async deletePoint(args, res) {
        const {
            id
        } = args;
        if (utils.isEmpty(id)) {
            return res.send(new FailModel("id不可以为空."))
        }
        const result = await pointServer.deletePoint(id)
        if (result) {
            return res.send(new SuccessModel("点位删除成功"))
        } else {
            return res.send(new FailModel("删除点位失败"))
        }
    },

    /**
     * 更新点位
     * @param {*} args 
     * @param {*} res 
     */
    async updatePoint(args, res) {
        const point = args;
        const [result] = await pointServer.updatePoint(point)

        if (result) {
            return res.send(new SuccessModel(point, "点位修改成功"))
        } else {
            return res.send(new FailModel("点位修改失败"))
        }
    },

    /**
     * 搜索点位
     * @param {*} args 
     * @param {*} res 
     */
    async searchPoint(args, res) {
        const {
            pageNum,
            pageSize,
            port_point_map_id,
            content
        } = args;
        const params = {
            port_point_map_id,
            content
        }
        const result = await pointServer.searchPoint(params)
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询点位成功"))
        } else {
            return res.send(new FailModel("查询点位失败"))
        }
    },

    /**
     * 批量删除点位
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeletePoint(args, res) {
        const {
            pointIds
        } = args;
        if (pointIds.length <= 0) {
            return res.send(new FailModel("pointIds不可以为空"))
        }
        const result = await pointServer.batchDeletePoint(pointIds)
        if (result) {
            return res.send(new SuccessModel("批量删除点位成功"))
        } else {
            return res.send(new FailModel("点位图批量删除失败"))
        }
    }
}

module.exports = pointController