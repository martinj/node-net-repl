var net = require('net'),
	repl = require('repl'),
	fs = require('fs'),
	path = require('path'),
	server = null;

fs.existsSync = fs.existsSync || path.existsSync;

function REPLServer(options) {
	this.options = options || {};
	this.server = null;
	this.sockets = [];
}

/**
 * Stop listening for connections and kill off current ones.
 * @param {Function} cb callback
 */
REPLServer.prototype.stop = function (cb) {
	this.sockets.forEach(function (sock) {
		sock.end();
	});
	this.server.close(cb);
};

/**
 * Start the server and listen for connections
 *
 * @param  {String|Number} listen port number or path to UNIX socket.
 * @param {String} [host] if omitted, the server will accept connections directed to any IPv4 address if you supplied a port number.
 */
REPLServer.prototype.listen = function () {
	var self = this;

	if (this.options.deleteSocketOnStart) {
		//remove old domain socket.
		if (fs.existsSync(arguments[0])) {
			fs.unlinkSync(arguments[0]);
		}
	}

	this.server = net.createServer(function (socket) {
		self.sockets.push(socket);
		var r = repl.start({
			prompt: self.options.prompt || 'repl> ',
			input: socket,
			output: socket,
			terminal: true,
			useGlobal: false
		});
		r.on('exit', function () {
			socket.end();
		});
	});
	this.server.listen.apply(this.server, arguments);

	return this;
};

/**
 * Create a new REPLServer instance
 *
 * @param  {Object} options
 * @return {REPLServer} a new REPLServer instance
 */
exports.createServer = function (options) {
	return new REPLServer(options);
};