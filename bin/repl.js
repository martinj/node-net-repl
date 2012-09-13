#!/usr/bin/env node

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

var repl = require('../');

repl.connect.apply(repl, parseCmd());