module.exports = async function (test,page) {test('Hash navigation', async t =>{

    await page.go('/test6');
    t.notThrow(async _ => await page.click('#setHash'),'Setting has navigation method');
    await page.click('#links');
    await page.click('#internalLink');

    t.equal(await page.path(),'/#/test1','Hashed URL correct');
    t.equal(await page.innerText('h1'),'Simple route - OK','Route is loaded');
})}