module.exports = async function (test,page) {test('Fallbacks', async t =>{

    await page.go('/blah');
    t.equal(await page.innerText('h1'),'Root fallback','Root fallback from root');

    await page.go('/test5/blah');
    t.equal(await page.innerText('h1'),'Root fallback','Root fallback from sub');

    await page.go('/test5/sub/blah');
    t.equal(await page.innerText('h1'),'Sub fallback','Sub fallback from sub');

    await page.go('/test5/sub2/blah');
    t.equal(await page.innerText('h1'),'Redirect test - OK','Fallback with redirect');
})}