const waveDataExcelServer = require('../../server/admin/waveDataExcelServer')
const {
    SuccessModel,
    FailModel
} = require("../../response/response")
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const fs = require("fs")
const path = require("path");
const COS = require("cos-nodejs-sdk-v5")
const cos = new COS({
    SecretId: Constants.txCosConfig.SecretId,
    SecretKey: Constants.txCosConfig.SecretKey,
})
// 存储路径
const dirPath = path.join("./");
const uploadUrl = "node-serve/wave-data-excel/"

const waveDataExcelController = {

    /**
     * 上传港口点位统计结果excel
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async uploadWaveDataExcel(args, file, res) {
        const {
            port_point_map_id
        } = args
        if (utils.isEmpty(port_point_map_id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("port_point_map_id不可以为空"))
        }
        const {
            filename,
            mimetype,
            originalname
        } = file
        console.log('file', file)
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("excel重命名失败"))
            }
            const localFile = dirPath + originalname
            const key = uploadUrl + originalname
            // 腾讯云上传文件
            const params = {
                Bucket: Constants.txCosConfig.Bucket,
                Region: Constants.txCosConfig.Region,
                // 上传文件执行的目录，作为key存在
                Key: key,
                // 上传文件路径
                FilePath: localFile,
                // 表示文件大小超出一个数值时使用分块上传
                SliceSize: 1024 * 1024 * 5,
            }
            cos.sliceUploadFile({
                ...params
            }, async (err, data) => {
                try {
                    if (err) {
                        return res.send(new FailModel("波形excel上传失败"))
                    }
                    fs.unlinkSync(localFile)
                    const params = {
                        port_point_map_id: port_point_map_id,
                        url: data.Location,
                        path: data.Key,
                        type: mimetype,
                        name: originalname,
                    }
                    const {
                        dataValues
                    } = await waveDataExcelServer.uploadWaveDataExcel(params)
                    if (dataValues !== null) {
                        return res.send(new SuccessModel({
                            ...data
                        }, "波形统计数据excel上传成功."))
                    } else {
                        return res.send(new FailModel("波形统计数据excel上传失败"))
                    }
                } catch (error) {
                    return res.send(new FailModel("波形统计数据excel上传失败"))
                }
            })
        })
    },

    /**
     * 获取全部港口点位统计结果excel
     * @param {*} args 
     * @param {*} res 
     */
    async waveDataExcelFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args;
        const result = await waveDataExcelServer.waveDataExcelFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取港口点位excel分析表成功"))
        } else {
            return res.send(new FailModel("获取港口点位excel分析表失败"))
        }
    },

    /**
     * 更新港口点位统计结果excel
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async updateWaveDataExcel(args, file, res) {
        const {
            port_point_map_id,
            id
        } = args;
        const {
            filename,
            mimetype,
            originalname
        } = file
        if (utils.isEmpty(port_point_map_id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请选择对应的港口点位数据分析excel"))
        }
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("港口点位统计excel的id不可以为空"))
        }
        // 图片重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("excel重命名失败"))
            } else {
                // 上传文件的路径
                const localFile = dirPath + originalname
                const key = uploadUrl + originalname
                // 腾讯云上传文件
                const params = {
                    Bucket: Constants.txCosConfig.Bucket,
                    Region: Constants.txCosConfig.Region,
                    // 上传文件执行的目录，作为key存在
                    Key: key,
                    // 上传文件路径
                    FilePath: localFile,
                    // 表示文件大小超出一个数值时使用分块上传
                    SliceSize: 1024 * 1024 * 3,
                }
                cos.sliceUploadFile({
                    ...params
                }, async (err, data) => {
                    try {
                        if (err) {
                            return res.send(new FailModel("波形统计数据excel上传失败"))
                        }
                        // 首先删除上传到本地的文件
                        fs.unlinkSync(localFile)
                        // 保存图片信息到相关表格中
                        const params = {
                            id: id,
                            port_point_map_id: port_point_map_id,
                            url: data.Location,
                            path: data.Key,
                            type: mimetype,
                            name: originalname
                        }
                        const [result] = await waveDataExcelServer.updateWaveForms(params)
                        if (result) {
                            return res.send(new SuccessModel({
                                ...data
                            }, "修改波形统计数据excel成功"))
                        } else {
                            return res.send(new FailModel("修改波形统计数据excel失败"))
                        }
                    } catch (error) {
                        return res.send(new FailModel("修改波形统计数据excel失败"))
                    }
                })
            }
        });
    },

    /**
     * 删除港口点位统计结果excel
     * @param {*} args 
     * @param {*} res 
     */
    async deleteWaveDataExcel(args, res) {
        const {
            id,
            name
        } = args;
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("excel名称不可以为空"))
        }
        // 删除文件的路径
        const key = uploadUrl + name
        // 腾讯云上传文件
        const params = {
            Bucket: Constants.txCosConfig.Bucket,
            Region: Constants.txCosConfig.Region,
            // 上传文件执行的目录，作为key存在
            Key: key,
        }
        cos.deleteObject({
            ...params
        }, async (err, data) => {
            if (err) {
                return res.send(new FailModel("excel删除失败"))
            } else {
                const result = await waveDataExcelServer.deleteWaveDataExcel(id)
                if (result) {
                    return res.send(new SuccessModel(data, "excel删除成功"))
                } else {
                    return res.send(new FailModel("excel删除失败"))
                }
            }
        })
    },

    /**
     * 批量删除
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteWaveDataExcel(args, res) {
        const {
            waveDataExcelIds,
            paths
        } = args;
        if (waveDataExcelIds.length <= 0) {
            return res.send(new FailModel("waveDataExcelIds不可以为空"))
        }
        if (paths.length <= 0) {
            return res.send(new FailModel("paths不可以为空"))
        }
        const params = {
            Bucket: Constants.txCosConfig.Bucket,
            Region: Constants.txCosConfig.Region,
            // Prefix表示列出的object的key以prefix开始，非必须
            Prefix: uploadUrl,
        }
        cos.getBucket({
            ...params
        }, (err, data) => {
            if (err) {
                return res.send(new FailModel("删除失败"))
            } else {
                // 需要删除的对象
                const objects = data.Contents.map((item) => {
                    // 这里判断输入的paths的值和item.Key是否相等
                    const result = paths.map((value) => {
                        if (item.Key === value) {
                            return {
                                Key: value
                            }
                        }
                    })
                    return result
                })
                const paramsData = {
                    Bucket: Constants.txCosConfig.Bucket,
                    Region: Constants.txCosConfig.Region,
                    // 要删除的对象列表
                    Objects: objects,
                }
                cos.deleteMultipleObject({
                    ...paramsData
                }, async (delError, delData) => {
                    if (delError) {
                        return res.send(new FailModel("excel批量删除失败"))
                    } else {
                        // 删除数据库数据
                        const result = await waveDataExcelServer.batchDeleteWaveDataExcel(waveDataExcelIds)
                        if (result) {
                            return res.send(new SuccessModel(delData, "excel批量删除成功"))
                        } else {
                            return res.send(new FailModel("excel批量删除失败"))
                        }
                    }
                })
            }
        })
    }
}

module.exports = waveDataExcelController