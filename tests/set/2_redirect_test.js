module.exports = async function (test,page) {test('Testing redirects', async t =>{

    await page.go('/redirect1');
    t.equal( await page.path(),'/redirect','Exact redirect');

    await page.go('/redirect2');
    t.equal( await page.path(),'/redirect','Exact redirect level 0');

    await page.go('/redirect2/sub/');
    t.equal( await page.path(),'/redirect','Exact redirect level 1');

    await page.go('/redirect2/sub/slug');
    t.equal( await page.path(),'/redirect','Exact redirect level 2');

    await page.go('/redirect4/off');
    await page.click('#setRedirectSwitch');
    t.equal(await page.innerText('b'),'On','Route switch');

    await page.go('/redirect5');
    await page.click('#setRedirectButton');
    t.equal( await page.path(),'/redirect','Set redirect prop');

})}