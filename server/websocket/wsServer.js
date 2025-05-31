const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const bimController = require('../../controller/portal/bimController');

// 创建WebSocket服务器
function setupWebSocketServer(server) {
	const wss = new WebSocket.Server({ noServer: true });

	// 处理WebSocket连接
	wss.on('connection', function connection(ws, request, client) {
		console.log('WebSocket连接已建立');

		// 连接建立时可以发送初始消息
		ws.send(
			JSON.stringify({ type: 'connection', message: 'WebSocket连接已建立' })
		);

		// 处理接收到的消息
		ws.on('message', function incoming(message) {
			console.log('收到消息:', message.toString());
		});

		// 处理连接关闭
		ws.on('close', function close() {
			console.log('WebSocket连接已关闭');
		});

		// 处理错误
		ws.on('error', function error(err) {
			console.error('WebSocket错误:', err);
		});
	});

	// 处理HTTP服务器升级请求
	server.on('upgrade', function upgrade(request, socket, head) {
		const pathname = url.parse(request.url).pathname;

		// 根据路径判断是否处理WebSocket请求
		if (pathname === '/ws/bim') {
			wss.handleUpgrade(request, socket, head, function done(ws) {
				// 调用BIM控制器处理WebSocket连接
				bimController.handleBimWebSocket(ws, request);
				wss.emit('connection', ws, request);
			});
		} else {
			socket.destroy();
		}
	});

	return wss;
}

module.exports = { setupWebSocketServer };
