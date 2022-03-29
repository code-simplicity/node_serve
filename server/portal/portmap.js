const PortMapModel = require("../../models/PortMapModel")

const portmap = {
    /**
     * 获取港口地图
     * @returns 
     */
    async portMapFindAll() {
        const result = await PortMapModel.findAll({
            order: [
                ["create_time"]
            ]
        })
        return result
    }
}

module.exports = portmap