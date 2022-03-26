/**
 * 返回状态码的约定
 */
const resCode = {
    SessionExpired: {
        code: 3000,
        codeMsg: "登录过期"
    },
    Fail: {
        code: 0,
        codeMsg: "失败"
    },
    Success: {
        code: 1,
        codeMsg: "成功"
    },
    ArgsError: {
        code: 40001,
        codeMsg: "参数错误"
    },
    ServerError: {
        code: 50000,
        codeMsg: "服务端错误"
    },
    UsernameOrPasswordError: {
        code: 30001,
        codeMsg: "用户名或者密码错误"
    },
    NoAuthority: {
        code: 10000,
        codeMsg: "没有权限"
    },
    UserExisted: {
        code: -1,
        codeMsg: "用户不存在"
    },
    // 检查内容不正确
    UnprocessableEntity: {
        code: 422
    }
}

module.exports = resCode