# node-net-repl

node.js REPL server/client over sockets that support autocomplete and colors.

[![Build Status](https://secure.travis-ci.org/martinj/node-net-repl.png)](http://travis-ci.org/martinj/node-net-repl)

## Installation

	npm install net-repl

## Quick Example

Creating a server

	var repl = require('net-repl');
	var srv = repl.createServer(opts).listen('repl.sock');

Adding shortcut for connecting to repl on your application

`opts` accepts all the options that are accepted by 
[repl.start](http://nodejs.org/api/repl.html#repl_repl_start_options)

Add the following to your package.json

	"scripts": {
		"test": "jasmine-node spec",
		"repl": "./node_modules/.bin/repl-client repl.sock"
	}

To connect run

	$ npm run repl

## The Server

	var repl = require('net-repl');

	var options = {
		prompt: 'foo> ', //optional set a custom prompt
		deleteSocketOnStart: false //if you use UNIX socket and the application exits without running stop() the unix socket file will remain, this deletes the old socket file when you start the server.
	}

	var portOrPath = '/tmp/repl.sock';

	//listen method
	//@param  {String|Number} listen port number or path to UNIX socket.
	//@param {String} [host] if omitted, the server will accept connections directed to any IPv4 address if you supplied a port number.
	var srv = repl.createServer(options).listen(portOrPath);


## The Client

	Usage: repl-client <port|domain socket path> <address if port specified>

	Examples:

	Unix domain socket
	$ repl /tmp/repl.sock

	Localhost on port
	$ repl 1337

	Specified host and port
	$ repl 1337 localhost


## Run Tests

	npm install
