const BimModel = require('../../models/BimModel');
const bimServer = {
	/**
	 * 门户获取bim
	 * @returns
	 */
	async getBimFindAll() {
		const result = await BimModel.findAll({
			order: [['create_time']],
		});
		return result;
	},

	/**
	 * 通过WebSocket发送BIM数据
	 * @param {WebSocket} ws WebSocket连接
	 */
	async sendBimDataViaWebSocket(ws) {
		try {
			const bimData = await this.getBimFindAll();

			if (bimData && bimData.length > 0) {
				// 发送数据总量信息
				ws.send(
					JSON.stringify({
						type: 'info',
						totalItems: bimData.length,
						message: '开始传输BIM数据',
					})
				);

				// 分块发送数据
				const chunkSize = 1; // 每次发送的数据项数量，可以根据实际情况调整

				for (let i = 0; i < bimData.length; i += chunkSize) {
					const chunk = bimData.slice(i, i + chunkSize);

					ws.send(
						JSON.stringify({
							type: 'data',
							currentChunk: i / chunkSize + 1,
							totalChunks: Math.ceil(bimData.length / chunkSize),
							data: chunk,
						})
					);

					// 添加小延迟，避免发送过快
					await new Promise((resolve) => setTimeout(resolve, 10));
				}

				// 发送完成消息
				ws.send(
					JSON.stringify({
						type: 'complete',
						message: 'BIM数据传输完成',
					})
				);

				return true;
			} else {
				ws.send(
					JSON.stringify({
						type: 'error',
						message: '获取BIM数据失败',
					})
				);

				return false;
			}
		} catch (error) {
			console.error('发送BIM数据时出错:', error);

			ws.send(
				JSON.stringify({
					type: 'error',
					message: '发送BIM数据时出错: ' + error.message,
				})
			);

			return false;
		}
	},
};

module.exports = bimServer;
