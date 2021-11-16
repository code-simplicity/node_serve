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
 }