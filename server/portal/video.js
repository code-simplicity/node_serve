const VideoModel = require("../../models/VideoModel")

const video = {
    /**
     * 获取港口演示视频
     * @returns 
     */
    async videoFindAll() {
        const result = await VideoModel.findAll({
            order: [
                ["create_time"]
            ]
        })
        return result
    }
}

module.exports = video