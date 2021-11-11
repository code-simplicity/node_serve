// 处理图像的上传
const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router();

const multer = require('multer')

const dirPath = path.join(__dirname, '..', 'public/assets/images')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdir(dirPath, function (err) {
                if (err) {
                    console.log(`err`, err)
                } else {
                    cb(null, dirPath)
                }
            })
        } else {
            cb(null, dirPath)
        }
    },
    filename: function (req, file, cb) {
        console.log('filename()', file)
        const ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

const upload = multer({
    storage
})

const uploadFile = upload.single('images')