// 用户模块
const {
    DataTypes
} = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require('../config/db')

// 返回一个用户模型架构
const UserModel = sequelizedb.define('tb_user', {
    // 在这里定义模型属性
    // id
    id: {
        type: DataTypes.STRING,
        // 主键
        primaryKey: true,
        // 约束不为空
        allowNull: false
    },
    // 用户名
    user_name: {
        type: DataTypes.STRING
    },
    // 性别
    sex: {
        type: DataTypes.STRING
    },
    // 密码
    password: {
        type: DataTypes.STRING
    },
    // 角色,默认为普通用户，role_normal，role_admin为管理员
    roles: {
        type: DataTypes.STRING,
        defaultValue: 'role_normal'
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
}, {

});

// 向外暴露UserModel
module.exports = UserModel;