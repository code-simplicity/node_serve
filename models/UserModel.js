// 用户模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

// 返回一个用户模型架构
const UserModel = sequelizedb.define('tb_user', {
    // id
    id: {
        type: DataTypes.STRING(20),
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false,
        comment: 'id'
    },
    // 用户名
    user_name: {
        type: DataTypes.STRING(32),
        comment: '用户名'
    },
    // 密码
    password: {
        type: DataTypes.STRING,
        comment: '密码'
    },
    // 角色,默认为普通用户，user，admin为管理员
    roles: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        comment: '角色,默认为普通用户，user，admin为管理员'

    },
    // 状态，0表示删除，1表示正常
    state: {
        type: DataTypes.STRING(1),
        defaultValue: '1',
        comment: '状态，0表示删除，1表示正常'

    },
    // 得分
    score: {
        type: DataTypes.STRING(5),
        defaultValue: 0,
        comment: '得分'

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

// 向外暴露UserModel
module.exports = UserModel;