/**
 * 统一返回结果
 */

class ResponseModel {
    constructor(data, msg) {
        if (typeof data === "string") {
            this.msg = data
            data = null
            msg = null
        }
        if (data) {
            this.data = data
        }
        if (msg) {
            this.msg = msg
        }
    }
}

/**
 * 返回成功的结果
 */
class SuccessModel extends ResponseModel {
    constructor(data, msg) {
        super(data, msg)
        this.code = 20000
    }
}

/**
 * 返回失败
 */
class FailModel extends ResponseModel {
    constructor(data, msg) {
        super(data, msg)
        this.code = 40000
    }
}

module.exports = {
    SuccessModel,
    FailModel
}