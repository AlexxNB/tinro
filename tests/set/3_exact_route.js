module.exports = async function (test,page) {test('Exact route', async t =>{

    await page.goto('http://localhost:5050/test2');
    t.equal((await page.$eval('h1', e => e.innerText)),'Exact route - OK','Exact route opens');

    await page.goto('http://localhost:5050/test2/sub');
    t.equal((await page.$eval('h1', e => e.innerText)),'Root fallback','Exact route not opens with sub path');
})}