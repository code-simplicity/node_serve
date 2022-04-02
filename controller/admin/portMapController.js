const portMapServer = require("../../server/admin/portMapServer")
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
const uploadUrl = "node-serve/port-map/"

const portMapController = {

    /**
     * 上传港口地图
     * @param {*} file 
     * @param {*} res 
     */
    async uploadPortMap(file, res) {
        /**
         * filename：是文件名的hash，"8e7c4c36a823cd4bd9508167cfc679a6"
         * mimetype 文件类型：'image/png'
         * originalname：原来的名字
         */
        const {
            filename,
            mimetype,
            originalname
        } = file
        // 图片重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("图片重命名失败"))
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
                let result = {}
                // 上传任务的回调
                let taskStatus = ""
                // 上传进度的对象
                let onHashProgress = {}
                let onProgress = {}
                cos.sliceUploadFile({
                    ...params,
                    // 上传任务创建时的回调函数，返回一个 taskId，
                    // 唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）
                    onTaskReady: (taskId) => {
                        taskStatus = taskId
                    },
                    // 计算文件 MD5 值的进度回调函数，回调参数为进度对象 progressData
                    onHashProgress: (progressData) => {
                        onHashProgress = progressData
                    },
                    // 上传文件的进度回调函数，回调参数为进度对象 progressData
                    onProgress: (progressData) => {
                        onProgress = progressData
                    }
                }, async (err, data) => {
                    try {
                        if (err) {
                            return res.send(new FailModel("图片上传失败"))
                        } else {
                            // 首先删除上传到本地的文件
                            fs.unlinkSync(localFile)
                            // 保存图片信息到相关表格中
                            result = {
                                taskStatus,
                                onHashProgress: onHashProgress,
                                onProgress: onProgress
                            }
                            const params = {
                                url: data.Location,
                                path: data.Key,
                                type: mimetype,
                                name: originalname,
                            }
                            const {
                                dataValues
                            } = await portMapServer.uploadPortMap(params)
                            if (dataValues !== null) {
                                return res.send(new SuccessModel({
                                    result,
                                    ...data
                                }, "港口图片上传成功"))
                            } else {
                                return res.send(new FailModel("港口图片上传失败"))
                            }
                        }
                    } catch (error) {
                        return res.send(new FailModel("港口图片上传失败"))
                    }
                })
            }
        });
    },

    /**
     * 获取港口地图
     * @param {*} args 
     * @param {*} res 
     */
    async portMapFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args;
        const result = await portMapServer.portMapFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询港口地图成功"))
        } else {
            return res.send(new FailModel("查询港口地图失败"))
        }
    },

    /**
     * 删除港口地图
     * @param {*} args 
     * @param {*} res 
     * @returns 
     */
    async portMapDelete(args, res) {
        const {
            id,
            name
        } = args;
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("图片名称不可以为空"))
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
        // 删除存储在cos中的图片
        cos.deleteObject({
            ...params,
        }, async (err, data) => {
            if (err) {
                return res.send(new FailModel("图片删除失败"))
            } else {
                const result = await portMapServer.portMapDelete(id)
                if (result) {
                    return res.send(new SuccessModel(data, "港口地图删除成功"))
                } else {
                    return res.send(new FailModel("港口地图删除失败"))
                }
            }
        })
    },

    /**
     * 更新港口地图
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async updatePortMap(args, file, res) {
        const {
            id,
        } = args
        /**
         * filename：是文件名的hash，"8e7c4c36a823cd4bd9508167cfc679a6"
         * mimetype 文件类型：'image/png'
         * originalname：原来的名字
         */
        const {
            filename,
            mimetype,
            originalname
        } = file
        // 图片重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("图片重命名失败"))
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
                            return res.send(new FailModel("图片上传失败"))
                        } else {
                            // 首先删除上传到本地的文件
                            fs.unlinkSync(localFile)
                            // 保存图片信息到相关表格中
                            const params = {
                                id: id,
                                url: data.Location,
                                path: data.Key,
                                type: mimetype,
                                name: originalname,
                            }
                            const [result] = await portMapServer.updatePortMap(params)
                            if (result) {
                                return res.send(new SuccessModel({
                                    ...data
                                }, "港口地图修改成功"))
                            } else {
                                return res.send(new FailModel("港口地图修改失败"))
                            }
                        }
                    } catch (error) {
                        return res.send(new FailModel("港口地图修改失败"))
                    }
                })
            }
        });
    }
}

module.exports = portMapController