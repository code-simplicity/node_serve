const {
    Op
} = require("sequelize");
const ChooseModel = require("../../models/ChooseModel")

const choose = {
    /**
     * 获取所有选择内容
     * @returns 
     */
    async chooseFindAll() {
        const result = await ChooseModel.findAll({
            order: [
                ["create_time"]
            ]
        })
        return result
    },
}

module.exports = choose