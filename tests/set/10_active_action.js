module.exports = async function (test,page) {test('Active action', async t =>{
    const links = ['activeNoActive','activeNotExact','activeExact','activeExactSub','activeCustomclass','activeWithdata'];
    await page.go('/test9');

    let set = await getLinks(page,links);

    t.ok(set['activeNoActive'].length === 0,'Not active link');
    t.ok(set['activeNotExact'].includes('active'),'Active, not exact');
    t.ok(set['activeExact'].includes('active'),'Active, exact');
    t.ok(set['activeExactSub'].length === 0,'Not active sub, exact');
    t.ok(set['activeCustomclass'].includes('customactive'),'Active, custom class');
    t.ok(set['activeWithdata'].includes('customactive'),'Active, custom class, with data');

    await page.go('/test9/sub');
    t.pass('Goto subpage');

    set = await getLinks(page,links);
    t.ok(set['activeNoActive'].length === 0,'Not active link');
    t.ok(set['activeNotExact'].includes('active'),'Active, not exact');
    t.ok(set['activeExact'].length === 0,'Not active, exact');
    t.ok(set['activeExactSub'].includes('active'),'Active sub, exact');
    t.ok(set['activeCustomclass'].includes('customactive'),'Active, custom class');
    t.ok(set['activeWithdata'].length === 0,'Not active, custom class, with data');
})}

async function getLinks(p,l){
    let o = {};
    for(let id of l){
        o[id] = await p.classList('#'+id);
    }
    return o;
}