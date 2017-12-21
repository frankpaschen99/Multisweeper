var io = require('socket.io')(7865);
const fs = require('fs');

/* Socket IO Cancer Below */
io.on('connection', function(socket) {
    console.log("Socket connected " + socket.id);
    socket.on('join_game', function(id, nickname) { // receive lobbyid and user's nickname
		if (nickname == "" || nickname == " ") {
			manager.createGameOrJoin(socket, "Unnamed Player", id);
		} else {
			manager.createGameOrJoin(socket, nickname, id);
		}
    });
	
	socket.on('adadadada', function(state, x, y, op) {
		// send data to all clients
		console.log(state + ", " + x + ", " + y);
		//if (!clientmanager.getClientFromSocket(socket.id) == null) 
			manager.getGameFromID(clientmanager.getClientFromSocket(socket.id).gameid).updateBoard(state, x, y, op);
	});
	

    socket.on('disconnect', function() { // get client object and remove them from the game
        var client = clientmanager.getClientFromSocket(socket.id);
		if (typeof client != 'undefined') manager.leaveGame(client);
		
		console.log("Socket disconnected: " + socket.id);
    });
});

class GameManager {
    constructor() {
        this.games = [];
    }
    /* Creates a new Game. Takes an array of clients and a unique lobby ID */
    createGame(_id) {
        var newGame = new Game(_id);
        this.games.push(newGame);
        return newGame;
    }
    /* Puts a player in a game if it already exists, creates one if not. Takes a socket.id, string nickname, number gameid*/
    createGameOrJoin(_socket, _nickname, _id) {
        if (this.games.indexOf(this.getGameFromID(_id)) >= 0) this.getGameFromID(_id).joinGame(new Client(_socket, _nickname, _id));
        else this.createGame(_id).joinGame(new Client(_socket, _nickname, _id));
    }
    /* Takes an integer ID and returns the game object associated with it */
    getGameFromID(_id) {
        for (var i = 0; i < this.games.length; i++)
            if (this.games[i].id == _id) return this.games[i];
    }
    leaveGame(client) {
        var game = this.getGameFromID(client.gameid);
        game.leaveGame(client);
    }
}
class Client {
    constructor(_socket, _nickname, _gameid) {
        this.socketObject = _socket;
        this.socket = _socket.id
        this.gameid = _gameid; // stores game id the client is in
        this.nickname = _nickname;
        this.score = 0;
		this.isHost = false;
    }
	promoteToHost() {
		this.isHost = true;
	}
	isHost() {
		return this.isHost;
	}
}
class ClientManager {
    constructor() {
        this.clients = [];
    }
    /* returns the Client object that corrosponds to a socket. Takes a socket.id */
    getClientFromSocket(socket) {
        for (var i = 0; i < this.clients.length; i++)
            if (this.clients[i].socket == socket) return this.clients[i];
    }
    addClient(client) {
        this.clients.push(client);
    }
    removeClient(client) {
        this.clients.remove(client);
    }
}
var manager = new GameManager();
var clientmanager = new ClientManager();
class Game {
    constructor(_id) {
        console.log("New game " + _id + " created!");
        this.clients = [];
        this.id = _id;
		this.gameBoard = null;
    }
	updateGameBoard(board) {
		this.gameBoard = board;
		this.clients.forEach(function(index) {
            index.socketObject.emit('game_board', board);
        });
	}
    /* puts a client into the game. takes a Client object for the parameter */
    joinGame(_client) {
		if (this.clients.length == 0) {
			// first player, make them host
			_client.promoteToHost();
			console.log("Client " + _client.nickname + " made host!");
		}
        this.clients.push(_client);
        clientmanager.addClient(_client);
        console.log("Player " + _client.nickname + " joined! Number of connnected clients: " + this.clients.length);

        this.sendPlayerList();
		//this.sendGameBoard();
        // send board
    }
    leaveGame(_client) {
        if (_client.nickname == this.drawing) {
            // oh no! the drawing player left! Handle this appropriately. (Clear board, restart round, pick new draw
        this.clients.remove(_client);
        }
        clientmanager.removeClient(_client);
        console.log("Player " + _client.nickname + " left! Number of connected clients: " + this.clients.length);
        if (this.clients.length == 0) {
            console.log("Game #" + this.id + " removed. Reason: Lobby empty.");
            manager.games.remove(this);
        }
        this.sendPlayerList();
    }
    sendPlayerList() { // called whenever a player disconnects/joins
        var names = [];
        this.clients.forEach(function(index) {
            names.push(index.nickname);
        });
        this.clients.forEach(function(index) {
            index.socketObject.emit('plist', names);
        });
    }
	updateBoard(state, x, y, op) {
		this.clients.forEach(function(index) {
				index.socketObject.emit('board_update', state, x, y, op);
        });
	}
}
Array.prototype.remove = function(object) {
    var index = this.indexOf(object);
    if (index > -1) this.splice(index, 1);
}