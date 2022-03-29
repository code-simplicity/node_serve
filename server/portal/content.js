const {
    Op
} = require("sequelize");
const ContentModel = require("../../models/ContentModel")

const content = {
    /**
     * 获取所有内容
     * @returns 
     */
    async contentFindAll() {
        const result = await ContentModel.findAll({
            order: [
                ["create_time"]
            ]
        })
        return result
    },

    /**
     * 获取选择内容
     * @param {*} args 
     * @returns 
     */
    async getContentByChooseId(choose_id) {
        const result = await ContentModel.findOne({
            where: {
                choose_id
            },
        })
        return result
    }
}

module.exports = content