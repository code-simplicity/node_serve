const {
    Op
} = require("sequelize");
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
    },

    /**
     * 通过所属内容查找对应的视频
     * @param {*} args 
     * @returns 
     */
    async videoSearchFindOne(args) {
        const {
            water_level,
            wave_direction,
            embank_ment,
        } = args;
        const result = await VideoModel.findOne({
            where: {
                [Op.and]: [{
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

module.exports = video