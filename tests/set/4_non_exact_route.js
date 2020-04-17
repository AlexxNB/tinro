module.exports = async function (test,page) {test('Not exact route', async t =>{

    await page.go('/test3');
    t.equal(await page.innerText('h1'),'Non exact route root- OK','Not exact route root opens');

    await page.go('/test3/sub');
    t.equal(await page.innerText('h1'),'Non exact route sub - OK','Not exact route sub opens');
})}