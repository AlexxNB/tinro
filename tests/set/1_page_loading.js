module.exports = async function (test,page) {test('Dev app launch', async t =>{

    await t.notThrow(async _ => await page.goto('http://localhost:5050'),'Page opened');
    t.equal((await page.$eval('h1', e => e.innerText)),'Loaded tests page - OK','App is loaded');

})}