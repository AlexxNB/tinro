const tape = require('tape');
const puppeteer = require('puppeteer');

test('e2e test',[
    require('./set/page_loading')
]);

function test(name,cbs){
    tape(name, async t => {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        for(let func of cbs){
            await func(t,page);
        }
        
        t.end();
        await browser.close();
    })
}