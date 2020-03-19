import socket_io from'socket.io';

import users from './users';
import connectedUsers from './storages/ConnectedUsers';

const createWebSocket = server => {

	const io = socket_io(server, {destroyUpgrade: false});

	// 伺服器重啟時 初始化連線人數
	connectedUsers.reset();

	io.on('connection', client => {

		client.on('REQUEST_CURRENT_USERS', () => {
			users.replyCurrentUsers(client);
		})

		client.on('REQUEST_USER_TOKEN', payload => {
			users.handleToken(payload, io, client);
		});

		client.on('BATTLE_INVITATION', payload => {
			users.sendBattleInvitation(payload, client, io);
		});

		client.on('ACCEPT_BATTLE_INVITATION', payload => {
			users.acceptBattleInvitation(payload, client, io);
		});

		client.on('UPDATE_RIVAL', payload => {
			users.handleGameRivalUpdate(payload, client);
		});

		client.on('GAME_END', payload => {
			users.handleCloseGame(client, io, payload);
		});

		client.on('disconnect', () => {
			users.handleDisconnect(io, client);
		});
	});
};

export default createWebSocket;