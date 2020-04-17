module.exports = async function (test,page) {test('Testing redirects', async t =>{

    await page.goto('http://localhost:5050/redirect1');
    t.equal((await page.url()),'http://localhost:5050/redirect','Exact redirect');

    await page.goto('http://localhost:5050/redirect2');
    t.equal((await page.url()),'http://localhost:5050/redirect','Not exact redirect level 0');

    await page.goto('http://localhost:5050/redirect2/sub/');
    t.equal((await page.url()),'http://localhost:5050/redirect','Not exact redirect level 1');

    await page.goto('http://localhost:5050/redirect2/sub/slug');
    t.equal((await page.url()),'http://localhost:5050/redirect','Not exact redirect level 2');

})}