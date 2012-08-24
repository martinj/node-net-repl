#!/usr/bin/env node
var net = require('net');

function printHelp() {
	console.log('Usage: repl-client <port|domain socket path> <address if port specified>\n');
	console.log('Examples:\n');
	console.log('Unix domain socket');
	console.log(' $ repl /tmp/repl.sock\n');
	console.log('Localhost on port');
	console.log(' $ repl 1337\n');
	console.log('Specified host and port');
	console.log(' $ repl 1337 localhost\n');
}

function parseCmd() {
	if (process.argv.length < 3) {
		printHelp();
		process.exit();
	}

	return process.argv.length > 3 ? [process.argv[2], process.argv[3]] : [process.argv[2]];
}

var sock = net.connect.apply(this, parseCmd());

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