// 图片模块
const {
    DataTypes,
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const ImageModel = sequelizedb.define('tb_image', {
    // id
    id: {
        type: DataTypes.STRING(),
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    // 图片路径
    url: {
        type: DataTypes.STRING(1024),
        comment: '图片路径'
    },
    // 图片存储路径
    path: {
        type: DataTypes.STRING(1024),
        comment: '图片存储路径'
    },
    // 图片类型,默认image/png
    type: {
        type: DataTypes.STRING(32),
        defaultValue: 'image/png',
        comment: '图片类型'
    },
    // 图片名称
    name: {
        type: DataTypes.STRING,
        comment: '图片名称'
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

// 模型同步
ImageModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = ImageModel;