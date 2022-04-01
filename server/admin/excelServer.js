const {
    Op
} = require("sequelize")
const UserModel = require("../../models/UserModel")
const excelServer = {
    /**
     * 批量创建
     * @param {*} args 
     */
    async excelUploadUser(args) {
        await UserModel.bulkCreate([args])
    },

    /**
     * 数据批量导出
     * @param {*} ids 
     * @returns 
     */
    async excelUserDownload(ids) {
        const result = await UserModel.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        })
        return result
    }
}
module.exports = excelServer