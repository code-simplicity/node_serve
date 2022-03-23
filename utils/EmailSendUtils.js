// 邮件发送的工具
const nodeMailer = require("nodemailer")

// 引入qq授权码和qq邮箱
const {
    partnerEmail
} = require("./Constants")

const config = {
    host: partnerEmail.QQ.host,
    port: partnerEmail.QQ.port,
    auto: {
        user: partnerEmail.QQ.user,
        pass: partnerEmail.QQ.pass,
    }
}

// 发送邮件的插件
const sendEmail = (email, code) => {
    // 发送验证码
    const transporter = nodeMailer.createTransport(config)
    const mail = {
        from: "水运工程系统",
        subject: "邮箱验证码",
        to: email,
        // 内容
        text: `您的验证码为:${code}, 五分钟之内有效，请谨慎保管。`,
        // 添加html标签
        html: '<a href="https://www.baidu.com.com">baidu</a>'
    }
    // 发送验证码
    return new Promise((resolve, reject) => {
        transporter.sendMail(mail, (error, info) => {
            error ? reject(error) : resolve(info.response)
            transporter.close()
        })
    })
}

module.exports = {
    sendEmail
}