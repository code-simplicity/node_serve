const portPointMapServer = require("../../server/admin/portPointMapServer")
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
const uploadUrl = "node-serve/port-point-map/"

const portPointMapController = {

    /**
     * 上传港口点位图
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async uploadPortPointMap(args, file, res) {
        const {
            filename,
            mimetype,
            originalname
        } = file
        const {
            water_level,
            wave_direction,
            embank_ment,
        } = args

        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel(error, "图片重命名失败"))
            } else {
                const localFile = dirPath + originalname
                const key = uploadUrl + originalname
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
                    if (err) {
                        return res.send(new FailModel(err, "港口点位图上传失败"))
                    } else {
                        fs.unlinkSync(localFile)
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
                        } = await portPointMapServer.uploadPortPointMap(params)
                        if (dataValues !== null) {
                            return res.send(new SuccessModel({
                                value: {
                                    ...dataValues
                                },
                                data: {
                                    ...data
                                }
                            }, "港口点位图上传成功"))
                        } else {
                            return res.send(new FailModel("港口点位地图上传失败"))
                        }
                    }
                })
            }
        })
    },

    /**
     * 获取港口点位图
     * @param {*} args 
     * @param {*} res 
     */
    async getPortPointMapFindAll(args, res) {
        const {
            pageNum,
            pageSize
        } = args;
        const result = await portPointMapServer.getPortPointMapFindAll()
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "港口点位图全部显示成功"))
        } else {
            return res.send(new FailModel("不存在港口点位图"))
        }
    },

    /**
     * 修改港口点位图
     * @param {*} args 
     * @param {*} file 
     * @param {*} res 
     */
    async updatePortPointMap(args, file, res) {
        const {
            id,
            water_level,
            wave_direction,
            embank_ment
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
        if (utils.isEmpty(id)) {
            return res.status(resCode.UnprocessableEntity.code).send(new FailModel("id不可以为空"))
        }
        // 图片重命名
        await fs.rename(filename, originalname, (error) => {
            if (error) {
                return res.send(new FailModel("图片重命名失败."))
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
                            return res.send(new FailModel("港口点位地图上传失败."))
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
                            const [result] = await portPointMapServer.updatePortPointMap(params)
                            if (result) {
                                return res.send(new SuccessModel({
                                    ...data
                                }, "港口点位图修改成功"))
                            } else {
                                return res.send(new FailModel("港口点位图修改失败"))
                            }
                        }
                    } catch (error) {
                        return res.send(new FailModel("港口点位图修改失败"))
                    }
                })
            }
        });
    },

    /**
     * 删除港口点位地图
     * @param {*} args 
     * @param {*} res 
     */
    async deletePortPointMap(args, res) {
        const {
            id,
            name
        } = args;
        if (utils.isEmpty(id)) {
            return res.send(new FailModel("id不可以为空"))
        }
        if (utils.isEmpty(name)) {
            return res.send(new FailModel("图片名称不可以为空"))
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
                return res.send(new FailModel("港口点位图删除失败"))
            } else {
                const result = await portPointMapServer.deletePortPointMap(id)
                if (result) {
                    return res.send(new SuccessModel(data, "港口点位图删除成功"))
                } else {
                    return res.send(new FailModel("港口点位图删除失败"))
                }
            }
        })
    },

    /**
     * 搜索港口点位地图
     * @param {*} args 
     * @param {*} res 
     */
    async searchPortPointMap(args, res) {
        // 通过水位，波浪来向，堤坝布置查询图片
        const {
            water_level,
            wave_direction,
            embank_ment,
            pageNum,
            pageSize
        } = args
        const params = {
            water_level,
            wave_direction,
            embank_ment,
        }
        const result = await portPointMapServer.searchPortPointMap(params)
        if (result.length > 0) {
            return res.send(new SuccessModel(utils.pageFilter(result, pageNum, pageSize), "查询港口点位图成功"))
        } else {
            return res.send(new FailModel("查询港口点位图失败"))
        }
    },

    /**
     * 批量删除港口点位地图
     * @param {*} args 
     * @param {*} res 
     */
    async batchDeletePortPointMap(args, res) {
        // paths为存储的key，这个和cos存储的Key进行对比
        const {
            portpointmapIds,
            paths
        } = args;
        if (portpointmapIds.length <= 0) {
            return res.send(new FailModel("portmapIds不可以为空"))
        }
        if (paths.length <= 0) {
            return res.send(new FailModel("paths不可以为空"))
        }
        /**
         * 首先先查看指定目录之下的所有文件，然后遍历文件之后进行，通过图片名字进行删除
         * 其次就是在通过portmapIds对数据库数据进行删除
         */
        // 腾讯云上传文件
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
                        return res.send(new FailModel("港口点位图批量删除失败"))
                    } else {
                        // 删除数据库数据
                        const result = await portPointMapServer.batchDeletePortPointMap(portpointmapIds)
                        if (result) {
                            return res.send(new SuccessModel(delData, "批量删除港口点位图成功"))
                        } else {
                            return res.send(new FailModel("港口点位图批量删除失败"))
                        }
                    }
                })
            }
        })
    }
}

module.exports = portPointMapController