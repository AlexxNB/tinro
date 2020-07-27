<script>
    import {routes,registerRouteObject} from './../dist/tinro_lib';

    export let path = '/*';
    export let fallback = false;
    export let redirect = false;

    let showContent = false;
    let params = {};

    registerRouteObject({
        path,
        fallback,
        redirect,
        onShow(){showContent=true},
        onHide(){showContent=false},
        onParams(newparams){params=newparams}
    });
</script>

{#if showContent}
    <slot {params}></slot>
{/if}