module.exports = async function (test,page) {test('No trailing slash', async t =>{
    await page.go('/test10');
    t.equal(await page.innerText('h1'),'Without trailing slash - OK','Route without slash opens');
})}