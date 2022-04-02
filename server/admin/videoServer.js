const {
    Op
} = require("sequelize")
const VideoModel = require("../../models/VideoModel")
const videoServer = {

    /**
     * 保存视频信息
     * @param {*} args 
     */
    async uploadVideo(args) {
        const {
            url,
            path,
            type,
            name,
            water_level,
            wave_direction,
            embank_ment,
        } = args
        const result = await VideoModel.create({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment,
        })
        return result
    },

    /**
     * 获取所有视频
     */
    async getVideoFindAll() {
        const result = await VideoModel.findAll({
            order: [
                ["create_time"]
            ],
        })
        return result
    },

    /**
     * 删除视频
     * @param {*} id 
     * @returns 
     */
    async deleteVideo(id) {
        const result = await VideoModel.destroy({
            where: {
                id
            }
        })
        return result
    },

    /**
     * 更新视频
     * @param {*} args 
     */
    async updateVideo(args) {
        const {
            id,
            url,
            path,
            type,
            name,
            water_level,
            wave_direction,
            embank_ment,
        } = args
        const result = await VideoModel.update({
            url: `http://${url}`,
            path: path,
            type: type,
            name: name,
            water_level: water_level,
            wave_direction: wave_direction,
            embank_ment: embank_ment,
        }, {
            where: {
                id,
            },
        })
        return result
    },

    /**
     * 批量删除
     * @param {*} ids 
     */
    async batchDeleteVideo(ids) {
        const result = await VideoModel.destroy({
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
        })
        return result
    },

    /**
     * 视频的模糊搜索
     * @param {*} args 
     */
    async searchVideo(args) {
        const {
            water_level,
            wave_direction,
            embank_ment
        } = args
        const result = await VideoModel.findAll({
            where: {
                [Op.or]: [{
                        water_level: water_level,
                    },
                    {
                        wave_direction: wave_direction,
                    },
                    {
                        embank_ment: embank_ment,
                    },
                ],
            },
        })
        return result
    }
}
module.exports = videoServer