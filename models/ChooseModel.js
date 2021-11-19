// 选择表
const {
    DataTypes
} = require("sequelize");

const sequelizedb = require('../config/db')

const ChooseModel = sequelizedb.define('tb_choose', {
    // id
    id: {
        type: DataTypes.STRING(),
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    // 父内容
    parent_content: {
        type: DataTypes.STRING,
        comment: '父内容'
    },
    // 子内容
    child_content: {
        type: DataTypes.STRING,
        comment: '子内容'
    },
    // 创建时间
    create_time: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now,
        comment: '创建时间'
    },
    // 更新时间
    update_time: {
        type: DataTypes.DATEONLY,
        defaultValue: Date.now,
        comment: '更新时间'
    }
}, {})

// 模型同步
ChooseModel.sync({
    alter: true
})

// 向外暴露ChooseModel
module.exports = ChooseModel;