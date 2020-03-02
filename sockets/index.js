const sanitizeHtml = require('sanitize-html');
const crypto = require('crypto'); // nodejs內建
const socket_io = require('socket.io');

module.exports = createWebSocket = server => {

	const io = socket_io(server, {destroyUpgrade: false});
	io.of('/').in("lobby").lobbyList = [];

	io.on('connection', client => {

		client.on('REQUEST_CURRENT_USERS', () => {
			client.emit("RESPONSE_CURRENT_USERS",  io.of('/').in("lobby").lobbyList);
		})

		client.on('REQUEST_USER_TOKEN', payload => {
			const user = {
				id: client.id,
				username: sanitizeHtml(payload.username),
				avatar: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(client.id).digest('hex')}?s=120&d=identicon`
			};
			client.emit("RESPONSE_USER_TOKEN", client.id);
			
			client.join("lobby");
			io.of('/').in("lobby").lobbyList.push(user);

			io.sockets.emit('ADD_ONE_USER', user);
		});

		client.on('disconnect', () => {
			const updatedLobbyList = io.of('/').in("lobby").lobbyList.filter(u => u.id !== client.id);
			io.of('/').in("lobby").lobbyList = updatedLobbyList;
			io.sockets.emit('DELETE_ONE_USER', client.id);
			client.leave('lobby');
		});
	});

	// wss.on('connection', (ws, client) => {

	// 	ws.on('message', msg => {
	// 		const message = JSON.parse(msg);
	// 		switch (message.type) {
	// 			case "REQUEST_CURRENT_USERS":
	// 				console.log('REQUEST_CURRENT_USERS');
	// 				send({
	// 					type: "RESPONSE_CURRENT_USERS",
	// 					data: wss.lobby,
	// 				});
	// 				break;
	// 			case "REQUEST_USER_TOKEN":
	// 				client.id = client.headers["sec-websocket-key"];
	// 				const user = {
	// 					id: client.id,
	// 					username: sanitizeHtml(message.username),
	// 					avatar: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(client.id).digest('hex')}?s=120&d=identicon`
	// 				};

	// 				wss.lobby.push(user);

	// 				send({
	// 					type: "RESPONSE_USER_TOKEN",
	// 					data: client.id,
	// 				});

	// 				wss.broadcast({
	// 					type: "ADD_ONE_USER",
	// 					data: user,
	// 				});

	// 				break;
	// 			c
	// 			default:
	// 				break;
	// 		}
	// 	});

	// 	ws.on('close', () => {
	// 		console.log(`${client.id}已離線`);
	// 		wss.lobby = wss.lobby.filter(u => u.id !== client.id);
	// 		wss.broadcast({
	// 			type: "lobbyList",
	// 			lobbyList: wss.lobby,
	// 		});
	// 	});

	// 	function send(data) {
	// 		ws.send(JSON.stringify(data));
	// 	}

	// });
}