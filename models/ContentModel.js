// 内容模型
const {
    Sequelize,
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const ContentModel = sequelizedb.define('tb_content', {
    // id
    id: {
        type: DataTypes.STRING(),
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    // 内容
    content: {
        type: DataTypes.TEXT,
        comment: '内容'
    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1',
        comment: '状态，0表示删除，1表示正常'
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
ContentModel.sync({
    alter: true
})

// 向外暴露UserModel
module.exports = ContentModel;