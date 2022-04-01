const UserModel = require("../../models/UserModel")
const excelServer = {
    /**
     * 批量创建
     * @param {*} args 
     */
    async excelUploadUser(args) {
        await UserModel.bulkCreate([args])
    }
}
module.exports = excelServer