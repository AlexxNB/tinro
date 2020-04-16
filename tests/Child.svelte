<script>
    import {router,Route} from 'tinro';
    export let params = {};

    let r_params = router.params();
</script>

<h1>I'm child</h1>

<h4>Router contents</h4>
<pre>
    {JSON.stringify($router)}
</pre>

<h4>Params frome store</h4>
<pre>
    {JSON.stringify(r_params)}
</pre>

<h4>Params from let:params</h4>
<pre>
    {JSON.stringify(params)}
</pre>
