<script>
    import {router} from 'tinro';

    let params = router.params();
</script>

<h1>I'm child</h1>

<h4>Params: </h4>
<div id="params">{JSON.stringify(params)}</div>

<h4>Query: </h4>
<div id="query">{JSON.stringify($router.query)}</div>
