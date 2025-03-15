/*
SQLyog Community v13.1.6 (64 bit)
MySQL - 5.7.30 : Database - design_project
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`design_project` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `design_project`;

/*Table structure for table `tb_bim` */

DROP TABLE IF EXISTS `tb_bim`;

CREATE TABLE `tb_bim` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT 'bim路径',
  `path` varchar(1024) DEFAULT NULL COMMENT 'bim存储路径',
  `type` varchar(255) DEFAULT NULL COMMENT 'bim类型',
  `name` varchar(255) DEFAULT NULL COMMENT 'bim名称',
  `state` varchar(2) DEFAULT '1' COMMENT '状态，0表示删除、1表示存在',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `tb_choose` */

DROP TABLE IF EXISTS `tb_choose`;

CREATE TABLE `tb_choose` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `content` varchar(255) DEFAULT NULL COMMENT '内容',
  `category` varchar(255) DEFAULT NULL COMMENT '内容类别',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `id` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_content` */

DROP TABLE IF EXISTS `tb_content`;

CREATE TABLE `tb_content` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `content` text COMMENT '内容',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `choose_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '选择列表id（外键）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `id` (`id`) USING BTREE,
  KEY `choose_id` (`choose_id`) USING BTREE,
  CONSTRAINT `tb_content_ibfk_1` FOREIGN KEY (`choose_id`) REFERENCES `tb_choose` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_point` */

DROP TABLE IF EXISTS `tb_point`;

CREATE TABLE `tb_point` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `content` varchar(255) DEFAULT NULL COMMENT '点位内容',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `port_point_map_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '港口点位地图表id（外键）',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `port_point_map_id` (`port_point_map_id`) USING BTREE,
  CONSTRAINT `tb_point_ibfk_1` FOREIGN KEY (`port_point_map_id`) REFERENCES `tb_port_point_map` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_port_map` */

DROP TABLE IF EXISTS `tb_port_map`;

CREATE TABLE `tb_port_map` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT '图片路径',
  `path` varchar(1024) DEFAULT NULL COMMENT '图片存储路径',
  `type` varchar(255) DEFAULT 'image/png' COMMENT '图片类型',
  `name` varchar(255) DEFAULT NULL COMMENT '图片名称',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_port_point_map` */

DROP TABLE IF EXISTS `tb_port_point_map`;

CREATE TABLE `tb_port_point_map` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT '图片路径',
  `path` varchar(1024) DEFAULT NULL COMMENT '图片存储路径',
  `type` varchar(32) DEFAULT 'image/png' COMMENT '图片类型',
  `name` varchar(255) DEFAULT NULL COMMENT '图片名称',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `water_level` varchar(1024) DEFAULT NULL COMMENT '水位',
  `wave_direction` varchar(1024) DEFAULT NULL COMMENT '波浪来向',
  `embank_ment` varchar(1024) DEFAULT NULL COMMENT '堤坝位置',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_refresh_token` */

DROP TABLE IF EXISTS `tb_refresh_token`;

CREATE TABLE `tb_refresh_token` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `refresh_token` text COMMENT '解析刷新的token',
  `token_key` varchar(20) DEFAULT NULL COMMENT 'token的key',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `user_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  CONSTRAINT `tb_refresh_token_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_user` */

DROP TABLE IF EXISTS `tb_user`;

CREATE TABLE `tb_user` (
  `id` varchar(20) NOT NULL COMMENT 'id',
  `user_name` varchar(32) DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `roles` varchar(255) DEFAULT 'user' COMMENT '角色,默认为普通用户，user，admin为管理员',
  `state` varchar(5) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `score` varchar(5) DEFAULT '0' COMMENT '得分',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `sex` varchar(20) DEFAULT NULL COMMENT '性别',
  `email` varchar(32) DEFAULT NULL COMMENT '邮箱',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_video` */

DROP TABLE IF EXISTS `tb_video`;

CREATE TABLE `tb_video` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT '视频路径',
  `path` varchar(1024) DEFAULT NULL COMMENT '视频存储路径',
  `type` varchar(255) DEFAULT 'video/mp4' COMMENT '视频类型',
  `name` varchar(255) DEFAULT NULL COMMENT '视频名称',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `water_level` varchar(1024) DEFAULT NULL COMMENT '水位',
  `wave_direction` varchar(1024) DEFAULT NULL COMMENT '波浪来向',
  `embank_ment` varchar(1024) DEFAULT NULL COMMENT '堤坝位置',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_wave_data_excel` */

DROP TABLE IF EXISTS `tb_wave_data_excel`;

CREATE TABLE `tb_wave_data_excel` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT 'excel路径',
  `path` varchar(1024) DEFAULT NULL COMMENT 'excel存储路径',
  `type` varchar(255) DEFAULT 'excel/xlsx' COMMENT 'excel类型',
  `name` varchar(255) DEFAULT NULL COMMENT 'excel名称',
  `state` varchar(2) DEFAULT '1' COMMENT '状态，0表示删除、1表示存在',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `port_point_map_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `port_point_map_id` (`port_point_map_id`),
  CONSTRAINT `tb_wave_data_excel_ibfk_1` FOREIGN KEY (`port_point_map_id`) REFERENCES `tb_port_point_map` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*Table structure for table `tb_wave_forms` */

DROP TABLE IF EXISTS `tb_wave_forms`;

CREATE TABLE `tb_wave_forms` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT '图片路径',
  `path` varchar(1024) DEFAULT NULL COMMENT '图片存储路径',
  `type` varchar(255) DEFAULT 'image/png' COMMENT '图片类型',
  `name` varchar(255) DEFAULT NULL COMMENT '图片名称',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `point_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `point_id` (`point_id`) USING BTREE,
  CONSTRAINT `tb_wave_forms_ibfk_1` FOREIGN KEY (`point_id`) REFERENCES `tb_point` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*Table structure for table `tb_wave_stats` */

DROP TABLE IF EXISTS `tb_wave_stats`;

CREATE TABLE `tb_wave_stats` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'id',
  `url` varchar(1024) DEFAULT NULL COMMENT '图片路径',
  `path` varchar(1024) DEFAULT NULL COMMENT '图片存储路径',
  `type` varchar(255) DEFAULT 'image/png' COMMENT '图片类型',
  `name` varchar(255) DEFAULT NULL COMMENT '图片名称',
  `state` varchar(1) DEFAULT '1' COMMENT '状态，0表示删除，1表示正常',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `point_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `point_id` (`point_id`) USING BTREE,
  CONSTRAINT `tb_wave_stats_ibfk_1` FOREIGN KEY (`point_id`) REFERENCES `tb_point` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
