const {
    Op
} = require("sequelize")
const ContentModel = require("../../models/ContentModel")
const contentServer = {

    /**
     * 添加内容
     * @param {*} args 
     */
    async addContent(args) {
        const {
            content,
            choose_id
        } = args;
        // choose_id存在就填写chooseid
        const result = await ContentModel.create({
            content,
            choose_id
        })
        return result
    },

    /**
     * 获取所有内容
     */
    async getContentFindAll() {
        const result = await ContentModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 修改内容
     * @param {*} args 
     * @returns 
     */
    async updateContent(args) {
        const {
            id,
            content,
            choose_id
        } = args
        const result = await ContentModel.update({
            content,
            choose_id
        }, {
            where: {
                id
            }
        })
        return result
    },

    /**
     * 删除内容
     * @param {*} id 
     * @returns 
     */
    async deleteContent(id) {
        const result = await ContentModel.destroy({
            where: {
                id
            }
        })
        return result
    },

    /**
     * 根据choose_id查找内容
     * @param {*} choose_id 
     */
    async searchContentByChooseId(choose_id) {
        const result = await ContentModel.findAll({
            where: {
                choose_id,
            },
        })
        return result
    },

    /**
     * 批量删除
     * @param {*} ids 
     */
    async batchDeleteContent(ids) {
        const result = await ContentModel.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        })
        return result
    }
}
module.exports = contentServer