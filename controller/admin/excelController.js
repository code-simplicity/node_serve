const excelServer = require("../../server/admin/excelServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const utils = require("../../utils/utils");
const fs = require("fs");
const xlsx = require("node-xlsx");
const JsMd5 = require("blueimp-md5")
const Constants = require("../../utils/Constants")

// 定义全局数组 ["学号", "姓名", "密码", "性别", "邮箱", "角色", "状态", "得分"]
const excelHead = ["id", "user_name", "password", "sex", "email", "roles", "state", "score"];

const excelController = {
    /**
     * 下载模板
     * @param {*} res 
     * @returns 
     */
    async exportExcel(res) {
        // 封装excel名字，表头
        const excelData = [{
            name: "用户模板.xlsx", // 给第一个sheet指名字
            data: [
                ["学号", "姓名", "密码", "性别", "邮箱", "角色", "状态", "得分"]
            ],
        }];
        // 配置表格列
        const optionArr = {
            "!cols": [{
                    wch: 10,
                },
                {
                    wch: 10,
                },
                {
                    wch: 10,
                },
                {
                    wch: 10,
                },
                {
                    wch: 10,
                },
                {
                    wch: 10,
                },
                {
                    wch: 10,
                },
                {
                    wch: 10,
                },
            ],
        };
        // 返回模板信息
        return res.send(xlsx.build(excelData, optionArr));
    },

    /**
     * 导入数据
     * @param {*} req 
     * @param {*} res 
     */
    async excelUploadUser(req, res) {
        try {
            // 重命名文件夹
            await fs.rename(
                // 上传文件路径，这里可以修改，后期上线改为服务器的路径
                req.file.path,
                req.file.destination + "/" + "用户模板.xlsx",
                (err) => {
                    if (err) {
                        return res.send(new FailModel("重命名失败"))
                    } else {
                        // 解析模板,返回对象形式的键值对
                        const excelObj = xlsx.parse("../public/upload/用户模板.xlsx");
                        const dataArr = excelObj[0].data;
                        const excelDataString = excelObj[0].data[0].toString()
                        // 添加的数据
                        const addData = {};
                        // 判断是不是使用的指定模板导入的  "学号,姓名,密码,性别,邮箱,角色,状态,得分"
                        if (excelDataString === "学号,姓名,密码,性别,邮箱,角色,状态,得分") {
                            // 删除二位数组第一项，也就是表头数据
                            dataArr.shift();
                            // 遍历
                            dataArr.map(async (item) => {
                                excelHead.map((key, index) => {
                                    // 先对password进行一个加密，再添加到数组中，如果这个key为password，那么对该值进行加密
                                    if (key === "password") {
                                        addData[key] = utils.desEncrypt(JsMd5(item[index]), Constants.User.PASSWORD_MESSAGE)
                                    } else {
                                        addData[key] = item[index]
                                    }
                                });
                                // 使用模板插入数据
                                await excelServer.excelUploadUser(addData)
                            });
                            return res.send(new SuccessModel("成功导入excel到数据库"));
                        } else {
                            // 不是的话,返回给前端错误状态
                            return res.send(new FailModel("模板匹配错误，请检查关键字"));
                        }
                    }
                }
            );
        } catch (error) {
            return res.send(new FailModel("导入异常，请重新尝试"));
        }
    },

    /**
     * 用户批量导出
     * @param {*} args 
     * @param {*} res 
     */
    async excelUserDownload(args, res) {
        // 数组，每个值直接用逗号隔开
        const {
            ids
        } = args;
        if (ids.length <= 0) {
            return res.send(new FailModel("ids不可以为空"))
        }
        const result = await excelServer.excelUserDownload(ids)
        if (result.length > 0) {
            const exportData = JSON.parse(JSON.stringify(result));
            const excelData = [{
                name: "用户模板.xlsx",
                data: [
                    [
                        "学号",
                        "姓名",
                        "密码",
                        "性别",
                        "邮箱",
                        "角色",
                        "状态",
                        "得分",
                        "创建时间",
                        "更新时间",
                    ],
                ],
            }, ];
            const optionArr = {
                "!cols": [{
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 10,
                    },
                    {
                        wch: 20,
                    },
                    {
                        wch: 20,
                    },
                ],
            };
            exportData.map((item) => {
                const exportArr = [];
                for (const key in item) {
                    exportArr.push(item[key]);
                }
                //  装载数据
                excelData[0].data.push(exportArr);
            });
            return res.send(xlsx.build(excelData, optionArr));
        } else {
            return res.send(new FailModel("用户数据导出失败，请勾选对应的表格数据"));
        }
    }
}

module.exports = excelController