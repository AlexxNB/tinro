<script>
	import {Route} from 'tinro';
	import Child from './Child.svelte';
</script> 

<div>
	<div>
		<a href="/test1">Test1</a>
		<a href="/test2">Test2</a>
		<a href="/test3">Test3</a>
		<a href="/test4/john">Test4</a>
		<a href="/hello/world">Test hello</a>
		<a href="//ya.ru">Ya</a>
		<a href="#huj">Hash</a>
	</div>

	<div>
		<Route>
			<Route path="/">Main page</Route>
			<Route path="/test1">TEST1</Route>
			<Route path="/test2/*">
				<p>
					<a href="/test2/sub">Test2 Subpage</a>
					<a href="/test2/sub3">Test2 NoSubpage</a>
				</p>
				<Route path="/sub">TEST2 SUBPAGE</Route>
				<Route fallback>NOT FOUND SUB</Route>
			</Route>
			<Route path="/hello/:name" let:params>Hello, {params.name}</Route>
			<Route path="/test4/:name" let:params><Child {params}/></Route>
			<Route fallback>NOT FOUND</Route>
		</Route>
	</div>
</div>



<style>
	div{display: flex;}
</style>