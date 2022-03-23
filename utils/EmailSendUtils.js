// 邮件发送的工具
const nodemailer = require("nodemailer");

// 引入qq授权码和qq邮箱
const {
    partnerEmail
} = require("./Constants")

const config = {
    host: partnerEmail.QQ.host,
    port: partnerEmail.QQ.port,
    secureConnection: true,
    secure: true,
    auth: {
        user: partnerEmail.QQ.user,
        pass: partnerEmail.QQ.pass,
    }
}

// 发送邮件的插件
const sendEmail = (emailAddress, code) => {
    // 发送验证码
    const transporter = nodemailer.createTransport(config)
    const mail = {
        from: "test<468264345@qq.com>", // 发送邮箱
        subject: "水运工程-邮箱验证码", // 主题
        to: emailAddress, // 去的地址
        // 内容
        text: `您的验证码为:${code}, 五分钟之内有效，请谨慎保管。`,
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mail, (err, res) => {
            try {
                if (err) {
                    reject(err)
                } else {
                    resolve(res.response)
                }
                // 关闭连接
                transporter.close()
            } catch (error) {
                reject(err)
                // 关闭连接
                transporter.close()
            }
        })
    })
}

module.exports = {
    sendEmail
}