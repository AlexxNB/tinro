module.exports = async function (test,page) {test('Child component test', async t =>{

    await page.go('/test8/world?a=1&name=world&list=1,2,3');
    t.equal(await page.innerText('#params'),'{"name":"world"}','Params passed');
    t.equal(await page.innerText('#query'),'{"a":"1","name":"world","list":["1","2","3"]}','Query passed');
})}