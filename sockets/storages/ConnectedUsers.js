let connectedUsers = [];

function reset(){
	connectedUsers = [];
}

function getAll(){
	return connectedUsers;
}

function getOne(id){
	return connectedUsers.filter(user => user.id === id)[0];
}

function addOne(newUser){
	connectedUsers.push(newUser);
}

function updateOneStatus(id, roomID){
	connectedUsers = connectedUsers.map(user => {
		if (user.id === id) {
			return {
				...user,
				status: user.status === "idle" ? "battling" : "idle",
				room: user.status === "idle" ? roomID : null
			};
		} else {
			return user;
		}
	});
}

function deleteOne(id){
	connectedUsers = connectedUsers.filter(user => user.id !== id);
}

export default {
	reset,
	getAll,
	getOne,
	addOne,
	updateOneStatus,
	deleteOne
};
