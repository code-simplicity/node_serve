// 图片模块
const {
    DataTypes,
    Sequelize
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
        allowNull: false
    },
    // 图片路径
    url: {
        type: DataTypes.STRING(1024),
    },
    // 图片存储路径
    path: {
        type: DataTypes.STRING(1024),
    },
    // 图片类型,默认image/png
    type: {
        type: DataTypes.STRING(32),
        defaultValue: 'image/png'
    },
    // 图片名称
    name: {
        type: DataTypes.STRING,
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1'
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
ImageModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = ImageModel;