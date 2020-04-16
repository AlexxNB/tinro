<script>
	import {Route} from 'tinro';
	import Child from './Child.svelte';
</script> 

<div class="layout">
	<div class="tests">
		<ul>
			<li><a href="/">Redirect test</a></li>
			<li> Redirect not exact <br/>
				<a href="/redirect2/sub">Sub</a> <a href="/redirect2/sub/slug">Sub2</a>
			</li>
			<li><a href="/test1">Simple route</a></li>
			<li><a href="/test2">Exact route</a></li>
			<li> Non exact route <br/>
				<a href="/test3">Root</a> <a href="/test3/sub">Sub</a>
			</li>
		</ul>
	</div>

	<div class="test">
		<Route>
			<Route path="/" redirect="/redirect" />
			<Route path="/redirect2/*" redirect="/redirect" />
			<Route path="/redirect"><h1>Redirect test - OK</h1></Route>
			<Route path="/test1"><h1>Simple route - OK</h1></Route>
			<Route path="/test2"><h1>Exact route - OK</h1></Route>
			<Route path="/test3/*">
				<Route path="/"><h1>Non exact route root- OK</h1></Route>
				<Route path="/sub"><h1>Non exact route sub - OK</h1></Route>
			</Route>
		</Route>
	</div>
</div>



<style>
	.layout{display: flex;}
	.tests{
		border-right: 1px solid black;
		padding: 10px;
		width: 300px;
	}
	.test{
		padding:10px;
	}
</style>