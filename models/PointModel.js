// 点位表-tb_point
const {
    Sequelize,
    DataTypes,
    Deferrable
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const PortPointMapModel = require('./PortPointMapModel')

const PointModel = sequelizedb.define('tb_point', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    port_point_map_id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        foreignKey: true,
        references: {
            model: PortPointMapModel,
            key: 'id',
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
            deferrable: Deferrable.INITIALLY_IMMEDIATE
        },
        comment: '港口点位地图表id（外键）'
    },
    content: {
        type: DataTypes.STRING,
        comment: '点位内容'
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

PointModel.sync({
    alter: true
})

module.exports = PointModel;