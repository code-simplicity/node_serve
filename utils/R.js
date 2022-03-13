const Constants = require("../utils/Constants")

// 封装返回状态
class R {
    // 返回status
    status;
    // 返回消息
    msg;
    // 返回数据
    data;

    // constructor
    constructor(status, data, msg) {
        this.status = status
        this.data = data
        this.msg = msg
    }

    /**
     * 成功
     * @param {*} data 
     */
    static success(data, msg) {
        return new R(Constants.baseResultCode.SUCCESS, data, msg)
    }

    // 失败
    static fail(errMsg) {
        return new R(Constants.baseResultCode.FAILED, errMsg)
    }
}

// 导入模块
module.exports = R