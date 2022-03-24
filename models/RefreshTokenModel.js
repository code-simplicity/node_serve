// 存储用户tb_refresh_token
const {
    DataTypes,
    Sequelize
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

const UserModel = require("./UserModel");

// 返回一个用户模型架构
const RefreshTokenModel = sequelizedb.define('tb_refresh_token', {
    // id
    id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: "id",
    },
    // 解析刷新的token
    refresh_token: {
        type: DataTypes.TEXT,
        comment: '解析刷新的token'
    },
    // tokenkey
    token_key: {
        type: DataTypes.STRING(20),
        comment: 'token的key'
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
}, {});

UserModel.hasOne(RefreshTokenModel, {
    foreignKey: "user_id",
    comment: "用户表id(外键)",
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
});

module.exports = RefreshTokenModel;