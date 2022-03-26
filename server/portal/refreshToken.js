const RefreshTokenModel = require("../../models/RefreshTokenModel")

const refreshToken = {
    /**
     * 获取refresh_token
     * @param {*} tokenKey 
     * @returns 
     */
    async getRefreshToken(tokenKey) {
        const result = await RefreshTokenModel.findOne({
            where: {
                refresh_token: tokenKey
            }
        })
        return result
    },

    /**
     * 获取未过期的refresh_token
     * @param {*} user_id 
     * @returns 
     */
    async getRefreshTokenByUserId(user_id) {
        const result = await RefreshTokenModel.findOne({
            where: {
                user_id: user_id
            }
        })
        return result
    },

    /**
     * 将token_key置空
     * @param {*} tokenKey 
     * @returns 
     */
    async updateRefreshToken(tokenKey) {
        const result = await RefreshTokenModel.update({
            token_key: ""
        }, {
            where: {
                token_key: tokenKey === undefined ? "" : tokenKey
            }
        })
        return result
    },

    /**
     * 创建数据
     * @param {*} args 
     * @returns 
     */
    async createRefreshToken(args) {
        const result = await RefreshTokenModel.create({
            ...args
        })
        return result
    }
}

module.exports = refreshToken