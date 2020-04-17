module.exports = async function (test,page) {test('Testing redirects', async t =>{

    await page.go('/redirect1');
    t.equal( await page.path(),'/redirect','Exact redirect');

    await page.go('/redirect2');
    t.equal( await page.path(),'/redirect','Not exact redirect level 0');

    await page.go('/redirect2/sub/');
    t.equal( await page.path(),'/redirect','Not exact redirect level 1');

    await page.go('/redirect2/sub/slug');
    t.equal( await page.path(),'/redirect','Not exact redirect level 2');

})}