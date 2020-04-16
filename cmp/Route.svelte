<script>
    import {current_component} from 'svelte/internal';
    import {getContext,setContext,afterUpdate} from 'svelte';
    import {url,getPathData,formatPath} from './../dist/aors_lib';

    export let path = '/*';
    export let fallback = false;

    let route = null;
    let show_content = false;
    let fallback_cb = null;
    let childs = [];
    let exact = fallback || !path.endsWith('/*');  

    path = formatPath(path);    

    const ctx = getContext('ROUTER:context');
    if(ctx) path = ctx.base+path;
    if(ctx && fallback) ctx.regFB( _ => show_content=true );

    const show_fallback = _ => fallback_cb ? fallback_cb() : ctx ? ctx.showFB() : null;

    setContext('ROUTER:context',{
            base: path,
        nochilds: exact,
           child: (show,path) => show ? childs.push(path) : childs=childs.filter( e => e!==path ),
           regFB: func => fallback_cb = func,
          showFB: show_fallback
    });
    
    $: route = getPathData(path,$url.path);
    $: show_content = fallback ? false : !!route && ( (exact && route.exact) || !exact );
    $: if(ctx && !fallback) ctx.child(show_content,path);

    afterUpdate( _ => (route && !route.exact && !exact && childs.length === 0) ? show_fallback() : null);
</script>

{#if show_content}
<slot></slot>
{/if}