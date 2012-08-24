var should = require('should'),
	repl = require('../../lib/repl'),
	net = require('net'),
	fs = require('fs');

//cleanup
if (fs.existsSync('repl.sock')) {
	fs.unlinkSync('repl.sock');
}

describe('REPLServer', function () {

	describe('#listen()', function () {
		it('should start listening on a port', function (done) {
			var srv = repl.createServer();
			srv.listen(5337);
			var sock = net.connect(5337);
			sock.on('connect', function () {
				srv.stop(function () {
					done();
				});
			});
		});

		it('should start listening on a domain socket', function (done) {
			fs.existsSync('repl.sock').should.equal(false);
			var srv = repl.createServer();
			srv.listen('repl.sock');

			var sock = net.connect('repl.sock');
			sock.on('connect', function () {
				srv.stop(function () {
					done();
				});
			});
		});

		it('should delete old domain socket file', function (done) {
			fs.writeFileSync('repl.sock', '');
			var srv = repl.createServer({ deleteSocketOnStart: true });
			srv.listen('repl.sock');
			fs.existsSync('repl.sock').should.equal(true);
			srv.stop(function () {
				done();
			});
		});

		it('should set custom prompt', function (done) {
			var srv = repl.createServer({ prompt: 'foobar' });
			srv.listen('repl.sock');

			var sock = net.connect('repl.sock');
			sock.on('data', function (d) {
				//strip the escape chars in the beginning
				var prompt = d.toString('utf8', 8, 14);
				prompt.should.equal('foobar');
				srv.stop(function () {
					done();
				});
			});
		});
	});

	describe('#stop()', function () {
		it('should stop listening for request', function (done) {
			var srv = repl.createServer();
			srv.listen('repl.sock');

			var sock = net.connect('repl.sock');
			sock.on('connect', function () {
				srv.stop(function () {
					var sock2 = net.connect('repl.sock');
					sock2.on('error', function (e) {
						e.code.should.equal('ENOENT');
						done();
					});
				});
			});
		});
	});
});