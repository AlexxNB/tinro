const {test,done,assert} = require('tape-modern');
const ports = require('port-authority');
const puppeteer = require('puppeteer');
const fs = require('fs');

assert.notThrow = async (func, msg = 'should not throw') => {
	try{
		await func();
		assert.pass(msg);
	}catch(err){
		assert.fail(msg);
	}
};

let cp;

(async _ => {
	try{
		const isBusy = await ports.check(5050);
		if(isBusy) throw new Error('Port 5050 already in use, can\'t launch dev server.')

		cp = require('child_process').spawn('sirv', ['tests/www', '-D', '-q', '-s', '-p', '5050']);
		await ports.wait(5050); 

		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		page.setDefaultTimeout('5000');

		page.innerText = async selector => await page.$eval(selector, e => e.innerText);
		page.go = async path => await page.goto('http://localhost:5050'+path);
		page.path = async _ => (await page.url()).replace('http://localhost:5050','');

		fs.readdirSync('tests/set').forEach(file => {
			if(!file.startsWith('_') && file.endsWith('.js')){
				require(`./set/${file}`)(test,page);
			}
		});

		await done;
		await browser.close();
		cp.kill();
	}catch(err){
		if(cp) cp.kill();
		throw Error(err);
	}
})();