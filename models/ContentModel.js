// 内容模型
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require("../config/db");

const ChooseModel = require("./ChooseModel");

const ContentModel = sequelizedb.define(
  "tb_content",
  {
    // id
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4, // 或 Sequelize.UUIDV1
      // 主键
      primaryKey: true,
      // 约束不为空
      allowNull: false,
      unique: true,
      comment: "id",
    },
    content: {
      type: DataTypes.TEXT,
      comment: "内容",
    },
    state: {
      type: DataTypes.STRING(1),
      defaultValue: "1",
      comment: "状态，0表示删除，1表示正常",
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
  },
  {}
);

ChooseModel.hasOne(ContentModel, {
  foreignKey: {
    name: "choose_id",
    comment: "选择列表id（外键）",
  },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
// ContentModel.belongsTo(ChooseModel);

// 向外暴露UserModel
module.exports = ContentModel;
