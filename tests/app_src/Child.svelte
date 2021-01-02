<script>
    import {router} from 'tinro';
    let meta = router.meta();
</script>

<h1>I'm child</h1>

<h4>Params: </h4>
<div id="params">{JSON.stringify($meta.params)}</div>

<h4>Query: </h4>
<div id="query">{JSON.stringify($meta.query)}</div>

<h4>Meta:</h4>
<div id="query"><pre>{JSON.stringify($meta,null,'  ')}</pre></div>