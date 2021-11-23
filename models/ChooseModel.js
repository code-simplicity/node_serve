// 选择表
const {
    Sequelize,
    DataTypes
} = require("sequelize");

const sequelizedb = require('../config/db')

const ChooseModel = sequelizedb.define('tb_choose', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        unique: true,
        comment: 'id'
    },
    content: {
        type: DataTypes.STRING,
        comment: '内容'
    },
    category: {
        type: DataTypes.STRING,
        comment: '内容类别'
    },
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1',
        comment: '状态，0表示删除，1表示正常'
    },
    create_time: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
        comment: '创建时间'
    },
    update_time: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
        comment: '更新时间'
    }
}, {})

// 向外暴露ChooseModel
module.exports = ChooseModel;