module.exports = async function (test,page) {test('Breadcrumbs', async t =>{
    await page.go('/test14');
    t.equal(await page.innerText('h1'),'Not redirected - OK','Not redirected');

    await page.click('#turnOnRedirect');
    t.pass('Change redirect variable');
    t.equal(await page.innerText('h1'),'Redirect test - OK','Route now redirects');
})}