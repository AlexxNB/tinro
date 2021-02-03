<script>
    import {meta,router} from 'tinro';
    let routeData = meta();
</script>

<h1>I'm child</h1>

<h4>Params: </h4>
<div id="params">{JSON.stringify($routeData.params)}</div>

<h4>Query: </h4>
<div id="query">{JSON.stringify($routeData.query)}</div>

<h4>Meta:</h4>
<div id="query"><pre>{JSON.stringify($routeData,null,'  ')}</pre></div>