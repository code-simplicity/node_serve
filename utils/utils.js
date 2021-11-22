const Constants = require('./Constants')

module.exports = {
    // 日期格式化
    dateFormat(str, type) {
        let date = new Date(str)
        let year = date.getFullYear()
        let month = date.getMonth()
        let day = date.getDate()
        let hour = date.getHours()
        let minute = date.getMinutes()
        let seconds = date.getSeconds()
        if (type === 'YYYY-MM-DD') {
            return `${year}_${month}_${day}`
        } else if (type === 'YYYY-MM-DD HH:MM:SS') {
            return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`
        } else if (type === 'MM/DD  HH:MM:SS') {
            return `${month}/${day} ${hour}:${minute}:${seconds}`
        }
    },

    // 判断图片类型是否是平时我们所支持的
    getType(contentType, name) {
        let type = null
        if (Constants.TYPE_PNG_WITH_PREFIX === contentType && name === Constants.TYPE_PNG) {
            type = Constants.TYPE_PNG
        } else if (Constants.TYPE_JPG_WITH_PREFIX === contentType && name === Constants.TYPE_JPG) {
            type = Constants.TYPE_JPG
        } else if (Constants.TYPE_GIF_WITH_PREFIX === contentType && name === Constants.TYPE_GIF) {
            type = Constants.TYPE_GIF
        }
        return type
    },

    //获取时间
    getNowFormatDate() {
        const date = new Date();
        const seperator = "-";
        const month = date.getMonth() + 1;
        const strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        const currentdate = date.getFullYear() + seperator + month + seperator + strDate;
        return currentdate.toString();
    }
}