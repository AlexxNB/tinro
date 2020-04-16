const tape = require('tape');
const puppeteer = require('puppeteer');

test('e2e test',[
    page_loading
]);



async function page_loading(t,p){
    await p.goto(`http://localhost:5000`);
    t.equal((await p.title()),'Tinro Test Page','Page is loaded');
}


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



