module.exports = async function (test,page) {test('Directive let:param', async t =>{

    await page.go('/test7/world');
    t.equal(await page.innerText('h1'),'Hello, world!','Parameter was passed');
})}