// 处理excel导入,导出
//引入node-xlsx解析excel模块
const node_xlsx = require('node-xlsx');
const fs = require('fs');

// 导入暴露的模型
const UserModel = require('../models/UserModel')

module.exports = {
    // 解析导入的excel,接收一个参数，就是文件
    parseExcel(config) {
        return new Promise((resolve, reject) => {
            // 支持的excel文件类有.xlsx .xls .xlsm .xltx .xltm .xlsb .xlam等
            const excel = node_xlsx.parse(config);
            //取得第一个excel表的数据
            const excelObj = excel[0].data;
            //存放数据
            let insertData = [];
            //循环遍历表每一行的数据
            for (const i = 1; i < excelObj.length; i++) {
                const rdata = excelObj[i];
                const CityObj = new Object();
                // ["id" : "101010100","user_name" : "测试1","sex" : "男","password" : "123456","roles" : "admin"]
                for (const j = 0; j < rdata.length; j++) {
                    CityObj[config.CityArray[j]] = rdata[j]
                }
                insertData.push(CityObj)
            }
            console.log(`insertData`, insertData)
            resolve(insertData)
        })
    },

}