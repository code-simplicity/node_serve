const BimModel = require("../../models/BimModel")
const bimServer = {

    /**
     * 门户获取bim
     * @returns 
     */
    async getBimFindAll() {
        const result = await BimModel.findAll({
            where: {
                order: ['create_time']
            }
        })
        return result
    }
}

module.exports = bimServer