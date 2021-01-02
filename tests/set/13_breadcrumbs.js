module.exports = async function (test,page) {test('Breadcrumbs', async t =>{
    await page.go('/test13');
    t.equal(await page.innerText('h1'),'[{"name":"Parent","path":"/test13"}]','Parent page breadcrumbs');

    await page.go('/test13/foo');
    t.equal(await page.innerText('h1'),'[{"name":"Parent","path":"/test13"},{"name":"Child","path":"/test13/foo"}]','Child page breadcrumbs');
})}