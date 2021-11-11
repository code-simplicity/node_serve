// 内容模型
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const ContentModel = sequelizedb.define('tb_content', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 内容
    content: {
        type: DataTypes.TEXT,
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
ContentModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = ContentModel;