<script>
    import {createRouteObject} from './../dist/tinro_lib';

    export let path = '/*';
    export let fallback = false;
    export let redirect = false;
    export let firstmatch = false;

    let showContent = false;
    let params = {};

    createRouteObject({
        path,
        fallback,
        redirect,
        firstmatch,
        onShow(){showContent=true},
        onHide(){showContent=false},
        onParams(newparams){params=newparams}
    });
</script>

{#if showContent}
    <slot {params}></slot>
{/if}