var net = require('net'),
	repl = require('repl'),
	fs = require('fs'),
	server = null;

function REPLServer(options, context) {
	this.options = options || {};
	this.server = null;
	this.sockets = [];
	this.context = context || this.options.context || {};
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


function merge(opts, defaults) {
	for (var k in opts) {
		defaults[k] = opts[k];
	}
	return defaults;
}

/**
 * Start the server and listen for connections
 *
 * @param  {String|Number} listen port number or path to UNIX socket.
 * @param {String} [host] if omitted, the server will accept connections directed to any IPv4 address if you supplied a port number.
 */
REPLServer.prototype.listen = function () {
	var self = this;

	//default to true, since that is what you normally want.
	if (this.options.deleteSocketOnStart !== false) {
		//remove old domain socket.
		if (fs.existsSync(arguments[0])) {
			fs.unlinkSync(arguments[0]);
		}
	}

	this.server = net.createServer(function (socket) {
		self.sockets.push(socket);
		var opts = merge(self.options, {
			prompt: self.options.prompt || 'repl> ',
			input: socket,
			output: socket,
			terminal: true,
			useGlobal: false,
			ignoreUndefined: true
		});
		var r = repl.start(opts);
		var context = self.options.context;
		if (context) {
			for (var k in context) {
				r.context[k] = 'function' === typeof context[k] ? context[k].bind(context) : context[k];
			}
		}

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
exports.createServer = function (options, context) {
	return new REPLServer(options, context);
};

/**
 * Create a new Client
 * same arguments as net.connect
 */


exports.connect = function () {
	var args = [].slice.call(arguments);
	var sock = net.connect.apply(this, args);

	process.stdin.pipe(sock);
	sock.pipe(process.stdout);

	sock.on('connect', function () {
		process.stdin.resume();
		process.stdin.setRawMode(true);
	});

	sock.on('close', function done() {
		process.stdin.setRawMode(false);
		process.stdin.pause();
		sock.removeListener('close', done);
	});

	process.stdin.on('end', function () {
		sock.destroy();
		console.log();
	});

	process.stdin.on('data', function (b) {
		if (b.length === 1 && b[0] === 4) {
			process.stdin.emit('end');
		}
	});
	return sock;
};
