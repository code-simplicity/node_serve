// 视频模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const VideoModel = sequelizedb.define('tb_video', {
    // id
    id: {
        type: DataTypes.STRING(),
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 视频路径
    url: {
        type: DataTypes.STRING(1024),
    },
    // 视频存储路径
    path: {
        type: DataTypes.STRING(1024),
    },
    // 视频类型,默认video/mp4
    type: {
        type: DataTypes.STRING,
        defaultValue: 'video/mp4'
    },
    // 视频名称
    name: {
        type: DataTypes.STRING,
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1'
    },
    // 水位
    water_level: {
        type: DataTypes.STRING(1024),
    },
    // 波浪来向
    wave_direction: {
        type: DataTypes.STRING(1024),
    },
    // 堤坝位置
    embank_ment: {
        type: DataTypes.STRING(1024),
    },
    // 创建时间
    create_time: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now
    },
    // 更新时间
    update_time: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now
    }
}, {})

// 模型同步
VideoModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = VideoModel;