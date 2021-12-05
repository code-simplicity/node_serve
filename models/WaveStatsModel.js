// 波统计图表-tb_wave_stats
const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const PointModel = require("./PointModel");

// 导入数据库连接方法,实例化Sequelize
const sequelizedb = require("../config/db");

const WaveStatsModel = sequelizedb.define(
  "tb_wave_stats",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: "id",
    },
    url: {
      type: DataTypes.STRING(1024),
      comment: "图片路径",
    },
    path: {
      type: DataTypes.STRING(1024),
      comment: "图片存储路径",
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "image/png",
      comment: "图片类型",
    },
    name: {
      type: DataTypes.STRING,
      comment: "图片名称",
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

PointModel.hasOne(WaveStatsModel, {
  foreignKey: "point_id",
  comment: "点位表id(外键)",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
// WaveStatsModel.belongsTo(PointModel);

module.exports = WaveStatsModel;
