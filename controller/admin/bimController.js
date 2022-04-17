const bimServer = require('../../server/admin/bimServer')
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
const uploadUrl = "node-serve/bim/"

const bimController = {

    /**
     * 上传三维模型file
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async uploadBim(file, res) {
        const {
            filename,
            mimetype,
            originalname
        } = file
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("bim重命名失败"))
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
                        return res.send(new FailModel("bim上传失败"))
                    }
                    fs.unlinkSync(localFile)
                    const params = {
                        url: data.Location,
                        path: data.Key,
                        type: mimetype,
                        name: originalname,
                    }
                    const {
                        dataValues
                    } = await bimServer.uploadBim(params)
                    if (dataValues !== null) {
                        return res.send(new SuccessModel({
                            ...data
                        }, "bim上传成功"))
                    } else {
                        return res.send(new FailModel("bim上传失败"))
                    }
                } catch (error) {
                    return res.send(new FailModel("bim上传失败"))
                }
            })
        })
    },

    /**
     * 获取全部三维模型
     * @param {*} args 
     * @param {*} res 
     */
    async bimFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args;
        const result = await bimServer.bimFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取bim成功"))
        } else {
            return res.send(new FailModel("获取bim失败"))
        }
    },

    /**
     * 更新三维模型
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async updateBim(args, file, res) {
        const {
            id
        } = args;
        const {
            filename,
            mimetype,
            originalname
        } = file
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        // 图片重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("bim失败"))
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
                            return res.send(new FailModel("bim上传失败"))
                        }
                        // 首先删除上传到本地的文件
                        fs.unlinkSync(localFile)
                        // 保存图片信息到相关表格中
                        const params = {
                            id: id,
                            url: data.Location,
                            path: data.Key,
                            type: mimetype,
                            name: originalname
                        }
                        const [result] = await bimServer.updateBim(params)
                        if (result) {
                            return res.send(new SuccessModel({
                                ...data
                            }, "修改bim成功"))
                        } else {
                            return res.send(new FailModel("修改bim失败"))
                        }
                    } catch (error) {
                        return res.send(new FailModel("修改bim失败"))
                    }
                })
            }
        });
    },

    /**
     * 删除三维模型
     * @param {*} args 
     * @param {*} res 
     */
    async deleteBim(args, res) {
        const {
            id,
            name
        } = args;
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("bim不可以为空"))
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
                return res.send(new FailModel("bim删除失败"))
            } else {
                const result = await bimServer.deleteBim(id)
                if (result) {
                    return res.send(new SuccessModel(data, "bim删除成功"))
                } else {
                    return res.send(new FailModel("bim删除失败"))
                }
            }
        })
    },

    /**
     * 批量删除三维模型
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteBim(args, res) {
        const {
            bimIds,
            paths
        } = args;
        if (bimIds.length <= 0) {
            return res.send(new FailModel("bimIds不可以为空"))
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
                        return res.send(new FailModel("bim批量删除失败"))
                    } else {
                        // 删除数据库数据
                        const result = await bimServer.batchDeleteBim(bimIds)
                        if (result) {
                            return res.send(new SuccessModel(delData, "bim批量删除成功"))
                        } else {
                            return res.send(new FailModel("bim批量删除失败"))
                        }
                    }
                })
            }
        })
    },

}

module.exports = bimController