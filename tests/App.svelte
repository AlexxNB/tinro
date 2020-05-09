<script>
	import {Route,router,active} from 'tinro';
	import Child from './Child.svelte';
</script> 

<div class="layout">
	<div class="tests">
		<ul>
			<li><a href="/redirect1">Redirect test</a></li>
			<li> Redirect not exact <br/>
				<a href="/redirect2/sub">Sub</a> <a href="/redirect2/sub/slug">Sub2</a>
			</li>
			<li><a href="/test1">Simple route</a></li>
			<li><a href="/test2">Exact route</a></li>
			<li> Non exact route <br/>
				<a href="/test3">Root</a> <a href="/test3/sub">Sub</a>
			</li>
			<li><a id="links" href="/test4">Links</a></li>
			<li> Fallbacks <br/>
				<a href="/blah">Root</a> <a href="/test5/blah">Root from sub</a> <a href="/test5/sub/blah">Sub from sub</a>
			</li>
			<li><a href="/test6">Change navigation type</a></li>
			<li><a href="/test7/world">Parameters</a></li>
			<li><a href="/test8/world?a=1&name=world&list=1,2,3">Child</a></li>
			<li><a href="/test9">Active action</a></li>
			<li><a href="/test10">Without trailing slash</a></li>
		</ul>
	</div>

	<div class="test">
		<Route>
			<Route path="/"><h1>Loaded tests page - OK</h1></Route>
			<Route path="/redirect1" redirect="/redirect" />
			<Route path="/redirect2/*" redirect="/redirect" />
			<Route path="/redirect"><h1>Redirect test - OK</h1></Route>
			<Route path="/test1"><h1>Simple route - OK</h1></Route>
			<Route path="/test2"><h1>Exact route - OK</h1></Route>
			<Route path="/test3/*">
				<Route path="/"><h1>Non exact route root- OK</h1></Route>
				<Route path="/sub"><h1>Non exact route sub - OK</h1></Route>
			</Route>
			<Route path="/test4">
				<h1>Links test</h1>
				<a href="/test1" id="internalLink">Internal route</a>
				<a href="/abc" id="ignoreLink" tinro-ignore>Internal route ignored</a>
				<a href="https://github.com/AlexxNB/tinro" id="externalLink">External route</a>
			</Route>
			<Route path="/test5/*">
				<Route path="/sub/*">
					<Route fallback><h1>Sub fallback</h1></Route>
				</Route>
			</Route>
			<Route path="/test6">
				<button id="setAPI" on:click={()=>{router.useHashNavigation(false); router.goto('/')}}>API</button>
				<button id="setHash" on:click={()=>{router.goto('/'); router.useHashNavigation(true)}}>Hash</button>
			</Route>
			<Route path="/test7/:name" let:params><h1>Hello, {params.name}!</h1></Route>
			<Route path="/test8/:name"><Child /></Route>
			<Route path="/test9/*">
				<h1>Links test</h1>
				<a use:active href="/test1" id="activeNoActive">Not active</a>
				<a use:active href="/test9" id="activeNotExact">Not exact</a>
				<a use:active href="/test9" id="activeExact" exact>Exact</a>
				<a use:active href="/test9/sub" id="activeExactSub" exact>Exact sub</a>
				<a use:active href="/test9" id="activeCustomclass" active-class="customactive">Not exact, custom class</a>
				<a use:active href="/test9" id="activeWithdata" data-exact data-active-class="customactive">exact, custom class, data</a>
				<a use:active href="/#/test9" id="activeHash" exact>Hash-style link, exact</a>
			</Route>
			<Route path="test10"><h1>Without trailing slash - OK</h1></Route>
			<Route fallback><h1>Root fallback</h1></Route>
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
	:global(.active){
		color: red !important;
	}
	:global(.customactive){
		color: green !important;
	}
</style>