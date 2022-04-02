const videoServer = require("../../server/admin/videoServer")
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
const multer = require("multer");
// 创建对象存储实例
const cos = new COS({
    SecretId: Constants.txCosConfig.SecretId,
    SecretKey: Constants.txCosConfig.SecretKey,
})
// 存储路径
const dirPath = path.join("./");
// 创建cos上传存储的位置
const uploadUrl = "node-serve/video/"

const videoController = {

    /**
     * 上传视频
     * @param {*} args req.body
     * @param {*} file req.file
     * @param {*} res res
     */
    async uploadVideo(args, file, res) {
        /**
         * filename：是文件名的hash，"8e7c4c36a823cd4bd9508167cfc679a6"
         * mimetype 文件类型：'image/png'
         * originalname：原来的名字
         */
        const {
            filename,
            mimetype,
            originalname
        } = file;
        const {
            water_level,
            wave_direction,
            embank_ment,
        } = args

        // 视频重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("视频重命名失败"))
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
                    AsyncLimit: 10 // 分块并发量
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
                    if (err) {
                        return res.send(new FailModel("视频上传服务器失败"))
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
                            water_level: water_level,
                            wave_direction: wave_direction,
                            embank_ment: embank_ment,
                        }
                        const {
                            dataValues
                        } = await videoServer.uploadVideo(params)
                        if (dataValues !== null) {
                            return res.send(new SuccessModel({
                                result,
                                ...data
                            }, "视频上传服务器成功"))
                        } else {
                            return res.send(new FailModel("视频上传服务器失败"))
                        }
                    }
                })
            }
        });
    },

    /**
     * 获取所有视频列表
     * @param {*} args 
     * @param {*} res 
     */
    async getVideoFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args
        const result = await videoServer.getVideoFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "获取所有视频成功"))
        } else {
            return res.send(new FailModel("获取视频失败"))
        }
    },

    /**
     * 删除视频
     * @param {*} args 
     * @param {*} res 
     */
    async deleteVideo(args, res) {
        const {
            id,
            name
        } = args
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(name)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("视频名称不可以为空"))
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
                return res.send(new FailModel("港口视频删除失败"))
            } else {
                const result = await videoServer.deleteVideo(id)
                if (result) {
                    return res.send(new SuccessModel(data, "港口视频删除成功"))
                } else {
                    return res.send(new FailModel("港口视频删除失败"))
                }
            }
        })
    },

    /**
     * 修改视频
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async updateVideo(args, file, res) {
        const {
            water_level,
            wave_direction,
            embank_ment,
            id
        } = args;
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
                    SliceSize: 1024 * 1024 * 5,
                }
                cos.sliceUploadFile({
                    ...params
                }, async (err, data) => {
                    try {
                        if (err) {
                            return res.send(new FailModel("视频修改上传失败"))
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
                                water_level: water_level,
                                wave_direction: wave_direction,
                                embank_ment: embank_ment,
                            }
                            const [result] = await videoServer.updateVideo(params)
                            if (result) {
                                return res.send(new SuccessModel({
                                    ...data
                                }, "视频相关信息修改成功"))
                            } else {
                                return res.send(new FailModel("视信息修改失败"))
                            }
                        }
                    } catch (error) {
                        return res.send(new FailModel("视信息修改失败"))
                    }
                })
            }
        });
    },

    /**
     * 批量删除
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeleteVideo(args, res) {
        const {
            ids,
            paths
        } = args;
        if (ids.length <= 0) {
            return res.send(new FailModel("ids不可以为空"))
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
                return res.send(new FailModel("获取图片列表失败"))
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
                        return res.send(new FailModel("港口视频批量删除失败"))
                    } else {
                        // 删除数据库数据
                        const result = await videoServer.batchDeleteVideo(ids)
                        if (result) {
                            return res.send(new SuccessModel(delData, "港口视频批量删除成功"))
                        } else {
                            return res.send(new FailModel("港口视频批量删除失败"))
                        }
                    }
                })
            }
        })
    },

    /**
     * 视频的模糊搜索
     * @param {*} args 
     * @param {*} res 
     */
    async searchVideo(args, res) {
        const {
            water_level,
            wave_direction,
            embank_ment,
            pageNum,
            pageSize
        } = args;
        const params = {
            water_level,
            wave_direction,
            embank_ment,
        }
        const result = await videoServer.searchVideo(params)
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询视频成功"))
        } else {
            return res.send(new FailModel("查询视频失败"))
        }
    }
}

module.exports = videoController