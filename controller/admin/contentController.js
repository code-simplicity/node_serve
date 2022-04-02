const contentServer = require("../../server/admin/contentServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");

const contentController = {

    /**
     * 添加内容
     * @param {*} args 
     * @param {*} res 
     */
    async addContent(args, res) {
        const {
            content,
            choose_id
        } = args;
        if (utils.isEmpty(content)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("内容不可以为空"))
        }
        const result = await contentServer.addContent(args)
        if (result !== null) {
            return res.send(new SuccessModel("添加内容成功"))
        } else {
            return res.send(new FailModel("添加内容失败"))
        }
    },

    /**
     * 获取所有内容
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async getContentFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await contentServer.getContentFindAll()
        if (result) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取所有内容成功"))
        } else {
            return res.send(new FailModel("获取内容失败"))
        }
    },

    /**
     * 修改内容
     * @param {*} args 
     * @param {*} res 
     */
    async updateContent(args, res) {
        const {
            id,
            content,
            choose_id
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(content)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("内容不可以为空"))
        }
        const [result] = await contentServer.updateContent(args)
        if (result) {
            return res.send(new SuccessModel("更改内容成功"))
        } else {
            return res.send(new FailModel("更改内容失败"))
        }
    },

    /**
     * 删除内容
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async deleteContent(args, res) {
        const {
            id
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        const result = await contentServer.deleteContent(id)
        if (result) {
            return res.send(new SuccessModel("删除内容成功"))
        } else {
            return res.send(new FailModel("删除内容失败"))
        }
    },

    /**
     * 根据choose_id查找内容
     * @param {*} args 
     * @param {*} res 
     */
    async searchContentByChooseId(args, res) {
        const {
            choose_id,
            pageNum,
            pageSize
        } = args
        if (utils.isEmpty(choose_id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("choose_id不可以为空"))
        }
        const result = await contentServer.searchContentByChooseId(choose_id)
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询内容成功"))
        } else {
            return res.send(new FailModel("查询内容失败"))
        }
    },

    /**
     * 批量删除
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteContent(args, res) {
        const {
            ids
        } = args;
        if (ids.length <= 0) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("contentIds不可以为空"))
        }
        const result = await contentServer.batchDeleteContent(ids)
        if (result) {
            return res.send(new SuccessModel("批量删除内容成功"))
        } else {
            return res.send(new FailModel("批量删除内容失败"))
        }
    }
}

module.exports = contentController