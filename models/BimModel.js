/**
 * bim表
 */
const {
    Sequelize,
    DataTypes
} = require("sequelize");

const sequelizedb = require('../config/db')

const BimModel = sequelizedb.define('tb_bim', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: "id"
    },
    url: {
        type: DataTypes.STRING(1024),
        comment: "bim路径",
    },
    path: {
        type: DataTypes.STRING(1024),
        comment: "bim存储路径"
    },
    type: {
        type: DataTypes.STRING,
        comment: "bim类型"
    },
    name: {
        type: DataTypes.STRING,
        comment: "bim名称"
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


module.exports = BimModel