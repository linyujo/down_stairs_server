import sanitizeHtml from 'sanitize-html';
import crypto from 'crypto'; // nodejs內建
import cuid from 'cuid';

import connectedUsers from './storages/ConnectedUsers';
import gameRooms from './storages/gameRooms';
import GamePlay from './gamePlay/index';

const replyCurrentUsers = client => {
	const payload = {
		userList: connectedUsers.getAll()
	};
	client.emit("RESPONSE_CURRENT_USERS",  payload);
};
const handleToken = (payload, io, client) => {
	client.emit("RESPONSE_USER_TOKEN", client.id);
	const newUser = {
		id: client.id,
		username: sanitizeHtml(payload.username),
		avatar: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(client.id).digest('hex')}?s=120&d=identicon`,
		status: "idle"
	};
	connectedUsers.addOne(newUser);
	client.join("lobby");
	io.emit('ADD_ONE_USER', {
		user: newUser
	});
};
const sendBattleInvitation = (payload, client, io) => {
	const roomID = cuid();
	client.join(roomID);
	io.to(payload.to).emit('BATTLE_INVITATION', {
		from: connectedUsers.getOne(client.id), // 邀請人
		roomID: roomID
	});
};
const acceptBattleInvitation = (payload, client, io) => {
	const inviterID = payload.to; // 邀請人
	const inviteeID = client.id; // 受邀人
	const roomID = payload.roomID;
	client.join(payload.roomID);

	handleUserUpdate(inviterID, io, roomID);
	handleUserUpdate(inviteeID, io, roomID);

	gameRooms[roomID] = new GamePlay({
		io: io,
		roomID: roomID,
		player1: inviterID,
		player2: inviteeID
	});

	gameRooms[roomID].init();
};
const handleCloseGame = (client, io, payload) => {
	if (gameRooms[payload.roomID]) {
		gameRooms[payload.roomID].unmount();
		delete gameRooms[payload.roomID];
	}
	client.leave(payload.roomID);
	handleUserUpdate(client.id, io);
}
const handleUserUpdate = (id, io, roomID = "") => {
	connectedUsers.updateOneStatus(id, roomID);
	io.sockets.emit('UPDATE_ONE_USER', {
		user: connectedUsers.getOne(id)
	});
};
const handleGameRivalUpdate = (payload, io) => {
	io.to(payload.to).emit("UPDATE_RIVAL", payload);
}
const handleDisconnect = (io, client) => {
	// const leavingUser = connectedUsers.getOne(client.id);
	// if (leavingUser.room) {
	// 	client.leave(leavingUser.room);
	// }
	connectedUsers.deleteOne(client.id);
	io.sockets.emit('DELETE_ONE_USER', {
		id: client.id
	});
	client.leave('lobby');
};

export default {
	replyCurrentUsers,
	handleToken,
	sendBattleInvitation,
	acceptBattleInvitation,
	handleGameRivalUpdate,
	handleCloseGame,
	handleDisconnect
};