const {test,done,assert} = require('tape-modern');
const ports = require('port-authority');
const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');

assert.notThrow = async (func, msg = 'should not throw') => {
	try{
		await func();
		assert.pass(msg);
	}catch(err){
		assert.fail(msg);
	}
};

(async _ => {
	try{
		const cp = require('child_process').spawn('sirv', ['tests/www', '-D', '-q', '-s', '-p', '5050']);
		await ports.wait(5050); 

		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		page.setDefaultTimeout('5000');

		fs.readdirSync('tests/set').forEach(file => {
			if(!file.startsWith('_') && file.endsWith('.js')){
				require(`./set/${file}`)(test,page);
			}
		});

		await done;
		await browser.close();
		cp.kill();
	}catch(err){
		cp.kill();
		throw Error(err);
	}
})();