<script>
	import {Route} from 'tinro';
</script> 

<p>
	<a href="/test1">Test1</a>
	<a href="/test2">Test2</a>
	<a href="/test3">Test3</a>
	<a href="//ya.ru">Ya</a>
	<a href="#huj">Hash</a>
</p>

<p>
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
		<Route fallback>NOT FOUND</Route>
	</Route>
</p>
