module.exports = async function (test,page) {test('Exact route', async t =>{

    await page.go('/test2');
    t.equal(await page.innerText('h1'),'Exact route - OK','Exact route opens');

    await page.go('/test2/sub');
    t.equal(await page.innerText('h1'),'Root fallback','Exact route not opens with sub path');
})}