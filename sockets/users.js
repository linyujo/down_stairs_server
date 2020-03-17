import sanitizeHtml from 'sanitize-html';
import crypto from 'crypto'; // nodejs內建

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
	const inviteeID = payload.inviteeID; // 受邀人
	const inviter = connectedUsers.getOne(client.id); // 邀請人
	const roomID = `${client.id}_${inviteeID}`; // 以 邀請人_受邀人 的id建立房間
	client.join(roomID);
	io.to(inviteeID).emit('RECEIVED_BATTLE_INVITATION', {
		inviter: inviter
	});
};
const acceptBattleInvitation = (payload, client, io) => {
	const inviterID = payload.inviterID; // 邀請人
	const inviteeID = client.id; // 受邀人
	const roomID = `${inviterID}_${inviteeID}`;
	client.join(roomID);
	
	io.to(inviterID).emit('ACCEPT_BATTLE_INVITATION');

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
const handleGameRivalUpdate = (payload, client) => {
	client.to(payload.roomID).emit("UPDATE_RIVAL", payload);
}
const handleDisconnect = (io, client) => {
	// const leavingUser = connectedUsers.getOne(client.id);
	// if (leavingUser.room) {
	// 	io.in(leavingUser.room).emit('GAME_END');
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