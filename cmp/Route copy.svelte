<script context="module">
    let count = 1;
</script>
<script>
    import {getContext,setContext,onMount} from 'svelte';
    import {routes,current} from './../dist/tinro_lib';

    const routeId = count++;
    let exact = true;
    let subroutes = [];

    export let path = '/';
    //export let fallback = false;

    const parentRoute = getContext('ROUTE:data');
    let base = path==='/' ? '' : path;

    if(parentRoute){
        base = parentRoute.base+base;
        onMount(_ => parentRoute.mount(routeId));
    }

    setContext('ROUTE:data',{base,mount: id => {
        subroutes.push(id)
        subroutes = subroutes;
        console.log('abc',subroutes);
        return _ => subroutes = subroutes.filter(e=>e!==id);
    }});

    $: console.log(base,subroutes);

   // $: routes.register(base,routeId,exact,fallback);
</script>

{#if $current[routeId]}
    <slot></slot>
{/if}