module.exports = async function (test,page) {test('Not exact route', async t =>{

    await page.goto('http://localhost:5050/test3');
    t.equal((await page.$eval('h1', e => e.innerText)),'Non exact route root- OK','Not exact route root opens');

    await page.goto('http://localhost:5050/test3/sub');
    t.equal((await page.$eval('h1', e => e.innerText)),'Non exact route sub - OK','Not exact route sub opens');
})}