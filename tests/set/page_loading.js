module.exports = async function (test,page) {test('Open Ya.ru', async t =>{

    await t.notThrow(async _ => await page.goto('http://localhost:5050'),'Page opened');
    t.equal((await page.title()),'Tinro Test Page','Page is loaded');

})}