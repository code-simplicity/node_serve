const PortMapModel = require("../../models/PortMapModel")
const portMapServer = {
    /**
     * 上传港口地图
     * @param {*} args 
     * @returns 
     */
    async uploadPortMap(args) {
        const {
            url,
            path,
            type,
            name
        } = args
        const result = await PortMapModel.create({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
        })
        return result
    },

    /**
     * 获取所有港口地图
     */
    async portMapFindAll() {
        const result = await PortMapModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 删除港口地图
     * @param {*} id 
     */
    async portMapDelete(id) {
        const result = await PortMapModel.destroy({
            where: {
                id,
            }
        });
        return result
    },

    /**
     * 更新港口地图
     * @param {*} args 
     */
    async updatePortMap(args) {
        const {
            id,
            url,
            path,
            type,
            name
        } = args
        const result = await PortMapModel.update({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
        }, {
            where: {
                id,
            },
        })
        return result
    }
}
module.exports = portMapServer