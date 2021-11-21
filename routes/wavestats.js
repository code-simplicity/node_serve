// 波形统计图标
const express = require('express')
const fs = require('fs')
const path = require('path')
const {
    Op
} = require("sequelize");

const router = express.Router();

const multer = require('multer')

// 导入暴露的模型
const WaveStatsModel = require('../models/WaveStatsModel')