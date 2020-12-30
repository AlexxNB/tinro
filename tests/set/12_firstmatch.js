module.exports = async function (test,page) {test('No trailing slash', async t =>{
    await page.go('/test12/foo/bar');
    t.equal(await page.innerText('h1'),'Only matched subpage- OK','Open first matched page');
    
    try{
       await page.innerText('#notmatch');
       t.fail('Second matched page didn\'t show');
    }catch{
       t.pass('Second matched page didn\'t show')
    }
})}