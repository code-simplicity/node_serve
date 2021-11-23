// 视频模块
const {
    Sequelize,
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const VideoModel = sequelizedb.define('tb_video', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4, // 或 Sequelize.UUIDV1
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    // 视频路径
    url: {
        type: DataTypes.STRING(1024),
        comment: '视频路径'
    },
    // 视频存储路径
    path: {
        type: DataTypes.STRING(1024),
        comment: '视频存储路径'
    },
    // 视频类型,默认video/mp4
    type: {
        type: DataTypes.STRING,
        defaultValue: 'video/mp4',
        comment: '视频类型'
    },
    // 视频名称
    name: {
        type: DataTypes.STRING,
        comment: '视频名称'
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1',
        comment: '状态，0表示删除，1表示正常'
    },
    // 水位
    water_level: {
        type: DataTypes.STRING(1024),
        comment: '水位'
    },
    // 波浪来向
    wave_direction: {
        type: DataTypes.STRING(1024),
        comment: '波浪来向'
    },
    // 堤坝位置
    embank_ment: {
        type: DataTypes.STRING(1024),
        comment: '堤坝位置'
    },
    // 创建时间
    create_time: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
        comment: '创建时间'
    },
    // 更新时间
    update_time: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
        comment: '更新时间'
    }
}, {})

// 向外暴露UserModel
module.exports = VideoModel;