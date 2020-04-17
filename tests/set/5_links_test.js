module.exports = async function (test,page) {test('Links', async t =>{

    await page.go('/test4');
    await page.click('#internalLink');
    t.equal(await page.innerText('h1'),'Simple route - OK','Internal link');
    await page.go('/test4');
    await page.click('#externalLink');
    t.equal(await page.url(),'https://github.com/AlexxNB/tinro','External link');
})}