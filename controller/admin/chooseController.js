const chooseServer = require("../../server/admin/chooseServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");

const chooseController = {

    /**
     * 添加选择
     * @param {*} args 
     * @param {*} res 
     */
    async addChoose(args, res) {
        const {
            content,
            category
        } = args
        if (utils.isEmpty(content)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("内容不可以为空"))
        }
        if (utils.isEmpty(category)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("分类不可以为空"))
        }
        const {
            dataValues
        } = await chooseServer.addChoose(args)
        if (dataValues !== null) {
            return res.send(new SuccessModel("添加选择内容成功"))
        } else {
            return res.send(new FailModel("添加内容失败"))
        }
    },

    /**
     * 获取所有的选择
     * @param {*} args 
     * @param {*} res 
     */
    async getChooseFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await chooseServer.getChooseFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取选择内容成功"))
        } else {
            return res.send(new FailModel("目前没有内容"))
        }
    },

    /**
     * 更新选择
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async updateChoose(args, res) {
        const {
            id,
            content,
            category
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(content)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("内容不可以为空"))
        }
        if (utils.isEmpty(category)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("分类不可以为空"))
        }
        const [result] = await chooseServer.updateChoose(args)
        if (result) {
            return res.send(new SuccessModel("修改内容成功"))
        } else {
            return res.send(new FailModel("修改内容失败"))
        }
    },

    /**
     * 删除选择
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async deleteChoose(args, res) {
        const {
            id
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        const result = await chooseServer.deleteChoose(id)
        if (result) {
            return res.send(new SuccessModel("删除选择成功"))
        } else {
            return res.send(new FailModel("删除选择失败"))
        }
    },

    /**
     * 批量删除
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteChoose(args, res) {
        const {
            ids
        } = args
        if (ids.length <= 0) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("ids不可以为空"))
        }
        const result = await chooseServer.batchDeleteChoose(ids)
        if (result) {
            return res.send(new SuccessModel("批量删除选择成功"))
        } else {
            return res.send(new FailModel("批量删除失败"))
        }
    }
}

module.exports = chooseController