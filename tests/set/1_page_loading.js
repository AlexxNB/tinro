module.exports = async function (test,page) {test('Dev app launch', async t =>{

    await t.notThrow(async _ => await page.go('/'),'Page opened');
    t.equal( await page.innerText('h1'),'Loaded tests page - OK','App is loaded');

})}