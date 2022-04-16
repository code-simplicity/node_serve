/**
 * 统计图数据的excel表
 */
const {
    Sequelize,
    DataTypes
} = require("sequelize");
const PortPointMapModel = require("./PortPointMapModel")
const sequelizedb = require('../config/db')

const WaveDataExcelModel = sequelizedb.define('tb_wave_data_excel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: "id"
    },
    url: {
        type: DataTypes.STRING(1024),
        comment: "excel路径",
    },
    path: {
        type: DataTypes.STRING(1024),
        comment: "excel存储路径"
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: "excel/xlsx",
        comment: "excel类型"
    },
    name: {
        type: DataTypes.STRING,
        comment: "excel名称"
    },
    state: {
        type: DataTypes.STRING(2),
        defaultValue: "1",
        comment: "状态，0表示删除、1表示存在"
    },
    create_time: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
        comment: "创建时间",
    },
    update_time: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
        comment: "更新时间",
    },
}, {})

// 添加外键
PortPointMapModel.hasOne(WaveDataExcelModel, {
    foreignKey: "port_point_map_id",
    comment: "港口点位图的id",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
})

module.exports = WaveDataExcelModel