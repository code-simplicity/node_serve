const bimServer = require('../../server/portal/bimServer');
const { SuccessModel, FailModel } = require('../../response/response');
const utils = require('../../utils/utils');

const bimController = {
	/**
	 * 门户获取港bim
	 * @param {*} args
	 * @param {*} res
	 */
	async getBimFindAll(args, res) {
		const { pageNum, pageSize } = args;
		const result = await bimServer.getBimFindAll();
		if (result.length > 0) {
			return res.send(
				new SuccessModel(
					utils.pageFilter(result, pageNum, pageSize),
					'获取bim成功'
				)
			);
		} else {
			return res.send(new FailModel('获取bim失败'));
		}
	},

	/**
	 * 处理WebSocket BIM数据请求
	 * 此方法不直接在路由中调用，而是在WebSocket连接建立后使用
	 * @param {WebSocket} ws WebSocket连接
	 * @param {Object} request HTTP请求对象
	 */
	async handleBimWebSocket(ws, request) {
		console.log('处理BIM WebSocket请求');

		// 解析请求参数（如果有）
		const urlParams = new URLSearchParams(request.url.split('?')[1]);

		// 发送初始连接消息
		ws.send(
			JSON.stringify({
				type: 'connection',
				message: 'BIM数据WebSocket连接已建立',
			})
		);

		// 监听客户端消息
		ws.on('message', async function (message) {
			const msgData = JSON.parse(message);

			if (msgData.action === 'getBimData') {
				// 开始发送BIM数据
				await bimServer.sendBimDataViaWebSocket(ws);
			}
		});

		// 也可以直接开始发送数据，不等待客户端请求
		// await bimServer.sendBimDataViaWebSocket(ws);
	},
};

module.exports = bimController;
