// 港口点位地图表-tb_port_point_map
const {
    Sequelize,
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const PortPointMapModel = sequelizedb.define('tb_port_point_map', {
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    url: {
        type: DataTypes.STRING(1024),
        comment: '图片路径'
    },
    path: {
        type: DataTypes.STRING(1024),
        comment: '图片存储路径'
    },
    type: {
        type: DataTypes.STRING(32),
        defaultValue: 'image/png',
        comment: '图片类型'
    },
    name: {
        type: DataTypes.STRING,
        comment: '图片名称'
    },
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1',
        comment: '状态，0表示删除，1表示正常'
    },
    water_level: {
        type: DataTypes.STRING(1024),
        comment: '水位'
    },
    wave_direction: {
        type: DataTypes.STRING(1024),
        comment: '波浪来向'
    },
    embank_ment: {
        type: DataTypes.STRING(1024),
        comment: '堤坝位置'
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

PortPointMapModel.sync({
    alter: true
})

module.exports = PortPointMapModel;