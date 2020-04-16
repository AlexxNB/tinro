<script>
    import {getContext,setContext,onMount} from 'svelte';
    import {url,formatPath} from './../dist/aors_lib';

    export let base='/';

    let fallback = false;

    setContext('ROUTER:base',formatPath(base));
    setContext('ROUTER:fallback',cb => fallback ? console.error("Fallback already exist") : fallback=cb);
</script>

<slot></slot>
