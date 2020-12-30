module.exports = async function (test,page) {test('Wildcard capture', async t =>{
  await page.go('/test13/abc/def/ghi');
  t.equal(await page.innerText('h1'),'abc','Normal route params work');
  t.equal(await page.innerText('h2'),'def/ghi','Wildcard is captured');

  await page.go('/test13/abc/def/ghi/');
  t.equal(await page.innerText('h1'),'abc','Normal route params work with trailing slash');
  t.equal(await page.innerText('h2'),'def/ghi/','Wildcard is captured with trailing slash');

  await page.go('/test13/abc/');
  t.equal(await page.innerText('h1'),'abc','Normal route params work without wildcard contents');
  t.equal(await page.innerText('h2'),'undefined','Wildcard parameter is not set when it is absent');
})}
