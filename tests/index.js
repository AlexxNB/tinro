const {test,done,assert} = require('tape-modern');
const ports = require('port-authority');
const puppeteer = require('puppeteer');
const fs = require('fs');


process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at:', p, 'reason:', reason)
	process.exit(1)
});

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
		const isFree = await ports.check(5050);
		if(!isFree) throw new Error('Port 5050 already in use, can\'t launch dev server.')

		let child = require('child_process').spawn('sirv', ['tests/www', '-D', '-q', '-s', '-p', '5050'],{
			detached: false
		});

		process.on("exit", () => child.kill());
		await ports.wait(5050); 

		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		page.setDefaultTimeout('5000');

		page.innerText = async selector => await page.$eval(selector, e => e.innerText);
		page.classList = async selector => await page.$eval(selector, e => Array.from(e.classList));
		page.go = async path => await page.goto('http://localhost:5050'+path);
		page.path = async _ => (await page.url()).replace('http://localhost:5050','');

		
		fs.readdirSync('tests/set').sort((a,b)=>Number(a.split('_')[0])-Number(b.split('_')[0])).forEach(file => {
			if(!file.startsWith('_') && file.endsWith('.js')){
				require(`./set/${file}`)(test,page);
			}
		});

		await done;
		await browser.close();
		process.exit(0);
	}catch(err){
		console.log('ERROR:'+err);
		process.exit(1);
	}
})();