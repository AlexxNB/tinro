module.exports = async function (test,page) {test('Navigation methods', async t =>{
    // History
    await page.go('/test6');

    await page.click('#setHistory');
    await page.click('#links');
    await page.click('#internalSubLink');

    t.equal(await page.path(),'/test3/sub','History URL correct');
    t.equal(await page.innerText('h1'),'Non exact route sub - OK','History route is loaded');

    // Hash
    await page.go('/test6');

    await page.click('#setHash');
    await page.click('#links');
    await page.click('#internalSubLink');

    t.equal(await page.path(),'/#/test3/sub','Hash URL correct');
    t.equal(await page.innerText('h1'),'Non exact route sub - OK','Hash route is loaded');

    // Memory
    await page.go('/test6');

    await page.click('#setMemory');
    await page.click('#links');
    await page.click('#internalSubLink');

    t.equal(await page.path(),'/','Memory URL correct');
    t.equal(await page.innerText('h1'),'Non exact route sub - OK','Memory route is loaded');
})}