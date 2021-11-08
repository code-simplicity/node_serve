const express = require('express')
const cors = require('cors')
// 文件系统模块，进行读写文件
const fs = require('fs')
const mysql = require('mysql');
const app = express()

app.use(cors())

app.get('/avi', function (req, res) {
    // 视频流
    let file = req.query.file
    // 接口的请求地址
    let path = `video/${file}`
    res.writeHead(200, {
        'Content-Type': 'video/mp4'
    });
    // 创建可读取的视频流
    let rs = fs.createReadStream(path + '.mp4');
    // 使用管道传输视频流
    rs.pipe(res);
    console.log(__dirname + path);
    rs.on('end', function () {
        res.end();
        console.log('end call');
    });
});

app.get('/onload', function (req, res) {
    console.log(__dirname);
    res.sendFile(__dirname + "\\pic\\port.png");
    //res.end();
});

app.get('/map', function (req, res) {
    let bank = req.query.bank;
    let fn = bank + "_map.png"
    let folder = "\\pic\\point_map\\";
    console.log(__dirname + folder + fn);
    res.sendFile(__dirname + folder + fn);
    //res.end();
});

app.get('/pic', function (req, res) {
    console.log(__dirname);
    let folder = req.query.folder;
    let subfolder = req.query.subfolder;
    let fn = req.query.fn + ".png"
    let path = `pic/${folder}/${subfolder}/${fn}`
    res.sendFile(__dirname + '/' + path);
    console.log(path);

});

app.get('/', function (req, res) {
    console.log(req.params);
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'portedu'
    });
    connection.connect();

    connection.query('select * from student', function (error, results) {
        if (error) {
            console.log('[SELECT ERROR] - ', error.message);
            return;
        }

        console.log('--------------------------SELECT----------------------------');
        console.log(results);
        console.log('------------------------------------------------------------\n\n');

        res.send(results);
        res.end();
    });

    connection.end();
});

app.get('/sql', function (req, res) {
    let id = req.query.id;
    console.log(id);

    const connection = mysql.createConnection({
        host: 'localhost',
        // 数据库用户
        user: 'root',
        // 数据库密码
        password: '123456',
        // 数据库连接名
        database: 'portedu'
    });
    connection.connect();

    connection.query('select id, time, point01 from nbwwave where id<' + id, function (error, results) {
        if (error) {
            console.log('[SELECT ERROR] - ', error.message);
            return;
        }

        console.log('--------------------------SELECT----------------------------');
        console.log(results);
        console.log('------------------------------------------------------------\n\n');

        if (results) {
            const alls = [];
            for (i = 0; i < results.length; i++) {
                const id = new String(results[i].id);
                const time = new String(results[i].time);
                const point01 = new String(results[i].point01);
                const all = {};
                all["id"] = id;
                all["time"] = time;
                all["point01"] = point01;
                alls.push(all);
            }
            const allstring = JSON.stringify(alls);
            res.send(allstring);
        }
        res.end();
    });

    connection.end();

    //res.send('hahaha, Getha');
});


//V1.0 参数设定方案：dbname, tbname, cols, id, rows, ids(idstart), ide(idend)
app.get('/query', function (req, res) {
    let dbname = "portedu";
    let colid = "id";
    let coltime = "time";
    let coljunk = ", ";
    let cols = "time, " + req.query.cols;
    let id = req.query.id;
    let tbname = req.query.tbname;
    let ids = req.query.ids;
    let ide = req.query.ide;
    console.log(id);

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'portedu'
    });
    connection.connect();

    if (ids && ide) {
        connection.query('select ' + cols + ' from ' + tbname + ' where id<=' + ide + ' and id>=' + ids + 'orderby id asc', function (error, results) {
            if (error) {
                console.log('[SELECT ERROR] - ', error.message);
                return;
            }

            console.log('--------------------------SELECT----------------------------');
            console.log(results);
            console.log('------------------------------------------------------------\n\n');

            if (results) {
                const jsss = JSON.parse(JSON.stringify(results));
                res.send(jsss);
            }
            res.end();
        });
    } else if (id) {
        connection.query('select ' + cols + ' from ' + tbname + ' where id<=' + id, function (error, results) {
            if (error) {
                console.log('[SELECT ERROR] - ', error.message);
                return;
            }

            console.log('--------------------------SELECT----------------------------');
            console.log(results);
            console.log('------------------------------------------------------------\n\n');

            if (results) {
                const jsss = JSON.parse(JSON.stringify(results));
                res.send(jsss);
            }
            res.end();
        });
    }
    connection.end();
});


// 变成全局作用域
const port = process.env.PORT || 5000
const host = process.env.HOST || ''

app.server = app.listen(port, host, () => {
    //通过服务对象实例调用address()获得当前服务程序的IP地址和端口号
    console.log(`应用实例，访问地址 @ http://${host ? host : 'localhost'}:${port}`)
});

console.log("Demo End!!!!!");