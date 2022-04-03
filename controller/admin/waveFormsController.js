const waveFormsServer = require("../../server/admin/waveFormsServer")
const {
    SuccessModel,
    FailModel
} = require('../../response/response');
const Constants = require("../../utils/Constants")
const utils = require("../../utils/utils");
const resCode = require("../../utils/resCode");
const fs = require("fs");
const path = require("path");
// 引入腾讯云对象存储
const COS = require('cos-nodejs-sdk-v5');
// 创建对象存储实例
const cos = new COS({
    SecretId: Constants.txCosConfig.SecretId,
    SecretKey: Constants.txCosConfig.SecretKey,
})
// 存储路径
const dirPath = path.join("./");
// 创建cos上传存储的位置
const uploadUrl = "node-serve/wave-forms/"

const waveFormsController = {

    /**
     * 上传波形图
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async uploadWaveForms(args, file, res) {
        const {
            point_id
        } = args;
        if (utils.isEmpty(point_id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请选择对应的点位id"))
        }
        const {
            filename,
            mimetype,
            originalname
        } = file
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("波形图重命名失败"))
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
                    SliceSize: 1024 * 1024 * 5,
                }
                cos.sliceUploadFile({
                    ...params
                }, async (err, data) => {
                    try {
                        if (err) {
                            return res.send(new FailModel("波形图上传失败"))
                        } else {
                            // 首先删除上传到本地的文件
                            fs.unlinkSync(localFile)
                            const params = {
                                point_id: point_id,
                                url: data.Location,
                                path: data.Key,
                                type: mimetype,
                                name: originalname,
                            }
                            const {
                                dataValues
                            } = await waveFormsServer.uploadWaveForms(params)
                            if (dataValues !== null) {
                                return res.send(new SuccessModel({
                                    ...data
                                }, "波形图上传成功"))
                            } else {
                                return res.send(new FailModel("波形图上传失败"))
                            }
                        }
                    } catch (error) {
                        return res.send(new FailModel("波形图上传失败"))
                    }
                })
            }
        })
    },

    /**
     * 获取所有的波形图
     * @param {*} args 
     * @param {*} res 
     */
    async waveFormsFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args;
        const result = await waveFormsServer.waveFormsFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取波形图成功"))
        } else {
            return res.send(new FailModel("获取波形图失败"))
        }
    },

    /**
     * 更新波形图
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async updateWaveForms(args, file, res) {
        const {
            point_id,
            id
        } = args;
        const {
            filename,
            mimetype,
            originalname
        } = file
        if (utils.isEmpty(point_id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("请选择对应的点位id"))
        }
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("波形图id不可以为空"))
        }
        // 图片重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("波形图重命名失败"))
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
                            return res.send(new FailModel("波形图上传失败"))
                        } else {
                            // 首先删除上传到本地的文件
                            fs.unlinkSync(localFile)
                            // 保存图片信息到相关表格中
                            const params = {
                                id: id,
                                point_id: point_id,
                                url: data.Location,
                                path: data.Key,
                                type: mimetype,
                                name: originalname
                            }
                            const [result] = await waveFormsServer.updateWaveForms(params)
                            if (result) {
                                return res.send(new SuccessModel({
                                    ...data
                                }, "修改波形图成功"))
                            } else {
                                return res.send(new FailModel("修改波形图失败"))
                            }
                        }
                    } catch (error) {
                        return res.send(new FailModel("修改波形图失败"))
                    }
                })
            }
        });
    },

    /**
     * 删除波形图
     * @param {*} args 
     * @param {*} res 
     */
    async deleteWaveForms(args, res) {
        const {
            id,
            name
        } = args;
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("波形图名称不可以为空"))
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
                return res.send(new FailModel("波形图删除失败"))
            } else {
                const result = await waveFormsServer.deleteWaveForms(id)
                if (result) {
                    return res.send(new SuccessModel(data, "波形图删除成功"))
                } else {
                    return res.send(new FailModel("波形图删除失败"))
                }
            }
        })
    },

    /**
     * 查找港口地图下所有的波形图
     * @param {*} args 
     * @param {*} res 
     */
    async findAllWaveFormsPointIds(args, res) {
        const {
            pointIds,
            pageNum,
            pageSize
        } = args
        if (pointIds.length <= 0) {
            return res.send(new FailModel("pointIds不可以为空"))
        }
        const result = await waveFormsServer.findAllWaveFormsPointIds(pointIds)
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询点位图下所有波形图成功"))
        } else {
            return res.send(new FailModel("查询点位图下所有波形图失败"))
        }
    },

    /**
     * 批量删除
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteWaveForms(args, res) {
        const {
            waveformsIds,
            paths
        } = args;
        if (waveformsIds.length <= 0) {
            return res.send(new FailModel("waveformsIds不可以为空"))
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
                        return res.send(new FailModel("波形图批量删除失败"))
                    } else {
                        // 删除数据库数据
                        const result = await waveFormsServer.batchDeleteWaveForms(waveformsIds)
                        if (result) {
                            return res.send(new SuccessModel(delData, "波形图批量删除成功"))
                        } else {
                            return res.send(new FailModel("波形图批量删除失败"))
                        }
                    }
                })
            }
        })
    }
}

module.exports = waveFormsController