module.exports = async function (test,assert) {
    test('Active action', async ctx =>{
        const links = [
            'activeNoActive',
            'activeNotExact',
            'activeExact',
            'activeExactSub',
            'activeCustomclass',
            'activeWithdata',
            'activeHash'
        ];

        await ctx.page.go('/test9');

        let set = await getLinks(ctx.page,links);

        assert.ok(set['activeNoActive'].length === 0, 'Not active link');
        assert.ok(set['activeNotExact'].includes('active'), 'Active, not exact');
        assert.ok(set['activeExact'].includes('active'), 'Active, exact');
        assert.ok(set['activeExactSub'].length === 0, 'Not active sub, exact');
        assert.ok(set['activeCustomclass'].includes('customactive'), 'Active, custom class');
        assert.ok(set['activeWithdata'].includes('customactive'), 'Active, custom class, with data');
        assert.ok(set['activeHash'].includes('active'), 'Active, hash-link');

        await ctx.page.go('/test9/sub');

        set = await getLinks(ctx.page,links);
        assert.ok(set['activeNoActive'].length === 0, 'Not active link');
        assert.ok(set['activeNotExact'].includes('active'), 'Active, not exact');
        assert.ok(set['activeExact'].length === 0, 'Not active, exact');
        assert.ok(set['activeExactSub'].includes('active'), 'Active sub, exact');
        assert.ok(set['activeCustomclass'].includes('customactive'), 'Active, custom class');
        assert.ok(set['activeWithdata'].length === 0, 'Not active, custom class, with data');
        assert.ok(set['activeHash'].length === 0, 'Not active, hash-link');
    }
)}

async function getLinks(p,l){
    let o = {};
    for(let id of l){
        o[id] = await p.classList('#'+id);
    }
    return o;
}