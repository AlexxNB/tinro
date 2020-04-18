<script>
    import {current_component} from 'svelte/internal';
    import {getContext,setContext,afterUpdate} from 'svelte';
    import {router,getPathData,formatPath,err} from './../dist/tinro_lib';

    export let path = '/*';
    export let fallback = false;
    export let redirect = false;

    let route = null;
    let show_content = false;
    let fallback_cb = null;
    let childs = [];
    let exact = fallback || !path.endsWith('/*');  

    const ctx = getContext('ROUTER:context');
    
    if(ctx && ( ctx.exact || ctx.fallback) ) err(
        `${fallback ? '<Route fallback>' : `<Route path="${path}">`}  can't be placed inside ${ctx.fallback ? 
            '<Route fallback>' :
            `<Route path="${ctx.path || '/'}"> with exact path property` }`
    );

    if(!ctx && fallback) err('<Route fallback> must be placed only inside <Route> with not exact path property')
   
    path = formatPath(path);  

    if(ctx) path = ctx.path+path;
    if(ctx && fallback) ctx.regFB( _ => show_content=true );

    const show_fallback = _ => fallback_cb ? fallback_cb() : ctx ? ctx.showFB() : null;

    setContext('ROUTER:context',{
            path,
           exact,
        fallback,
           child: (show,path) => show ? childs.push(path) : childs=childs.filter( e => e!==path ),
           regFB: func => fallback_cb = func,
          showFB: show_fallback
    });
    
    $: route = getPathData(path,$router.path);
    $: if(route && ((route.exact && exact) || !exact) && redirect) router.goto(redirect);
    $: setContext('ROUTER:params',route ? route.params : {});
    $: show_content = fallback ? false : !!route && ( (exact && route.exact) || !exact );
    $: if(ctx && !fallback) ctx.child(show_content,path);

    afterUpdate( _ => (route && !route.exact && !exact && childs.length === 0) ? show_fallback() : null);
</script>

{#if show_content}
<slot params={ route ? route.params : {} }></slot>
{/if}