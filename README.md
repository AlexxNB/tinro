# tinro

![npm](https://img.shields.io/npm/v/tinro?style=flat-square) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/AlexxNB/tinro/Publish%20on%20NPM?label=test&style=flat-square) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/tinro?label=Bundle%20size&style=flat-square) ![npm](https://img.shields.io/npm/dt/tinro?style=flat-square) 


The tinro is highly declarative, very tiny ([~4.5 Kb (1.9 Kb gzipped)](https://github.com/AlexxNB/tinro/blob/master/COMPARE.md)), dependency free router for [Svelte's](https://svelte.dev) web applications.

## Features

* Just one component for declare routes in your app
* Links are just common native `<a>` elements
* History API navigation or hash-navigation
* Simple nested routes
* Routes with parameters (`/hello/:name`)
* Redirects
* Fallbacks on any nested level
* Parsing query parameters (`?x=42&hello=world&fruits=apple,banana,orange`)
* [Svelte's REPL](https://svelte.dev/repl/4bc37ff40ada4111b71fe292a4eb90f6) compitable

## Documentation

* [Install](#install)
* [Getting started](#getting-started)
* [Nesting](#nesting)
* [Links](#links)
* [Redirects](#redirects)
* [Fallbacks](#fallbacks)
* [Parameters](#parameters)
* [Navigation method](#navigation-method)
* [API](#api)
* [Recipes](#recipes)
    - [Lazy loading](#lazy-loading-components)
    - [Transitions](#transitions)
    - [Guarded routes](#guarded-routes)
    - [Scroll on top](#scroll-on-top)


## Install

Install tinro as dev dependency in the your Svelte project:

```shell
$ npm i -D tinro
```

## Getting started

**The tinro is very simple!** It provides just *one component* - `<Route>`. So common app structure looks like:

```html
<script>
    import {Route} from 'tinro'; 
    import Contacts from './Contacts.svelte'; // <h1>Contacts</h1>
</script>

<nav>
    <a href="/">Home</a>
    <a href="/portfolio">Portfolio</a>
    <a href="/contacts">Contacts</a>
</nav>

<Route path="/"><h1>It is main page</h1></Route>
<Route path="/portfolio/*">
    <Route path="/">
        <h1>Portfolio introduction</h1>
        <nav>
            <a href="/portfolio/sites">Sites</a> 
            <a href="/portfolio/photos">Photos</a>
        </nav>
    </Route>
    <Route path="/sites"><h1>Portfolio: Sites</h1></Route>
    <Route path="/photos"><h1>Portfolio: Photos</h1></Route>
</Route>
<Route path="/contacts"><Contacts /></Route>
```
See example in action in the [Svelte's REPL](https://svelte.dev/repl/4bc37ff40ada4111b71fe292a4eb90f6)

## Nesting

There are two types of routes you can declare in the `<Route>` component's `path` property:

### Exact path

Shows its content only when `path` exact matched URL of the page. You can't place nested `<Route>` components inside such components.

```html
<Route path="/">...</Route>
<Route path="/page">...</Route>
<Route path="/page/subpage">...</Route>
```

### Non-exact path

The `<Route>` components with `path` property which ends with `/*` are showing their content when a part of the page's URL is matched with path before the `/*`. You are able to place nested `<Routes>` inside components with non-exact path only.

```html
<Route path="/books/*">
    Books list:
    <Route path="/fiction">...</Route>
    <Route path="/drama">...</Route>
</Route>
```

The `path` property of the nested `<Routes>` is relative to its parent. So to see the _Fiction_ category in the above example - you should point your browser on `http://mysite.com/books/fiction`.

Nested routes inside childs components also works. So we can rewrite the example this way:

```html
<!-- Bookslist.svelte-->
...
Books list:
<Route path="/fiction">...</Route>
<Route path="/drama">...</Route>

<!-- App.svelte-->
...
<Route path="/books/*">
    <Bookslist/>
</Route>
```

## Links

There no special component for links. Just use native `<a>` elements. When the `href` attribute starts with single `/` sign (like `/mypage` or just `/`), it will be treated as internal link which will be matched with defined routes. Other cases does not affect on links behavior. 

All internal links will be passed into the tinro router, but it is possible to prevent this by adding `tinro-ignore` or `data-tinro-ignore` attribute:

```html
<a href="/api/auth" tinro-ignore>Go to API page</a>
```

In case you need to add `active` class on the links where path is corresponding current URL, use `active` action from the `tinro` package:

```html
<script>
    import {active} from 'tinro';
</script>   

<!-- Common usage:
     class `active` will be added when URL is '/page' or any relative path like '/page/sub/sub' -->
<a href="/page" use:active>Link</a>

<!-- Exact match:
     class `active` will be added only when URL is exact equal '/page' but NOT like '/page/sub' -->
<a href="/page" use:active exact>Link</a>

<!-- Custom class:
    class `myactive` will be added if link is active-->
<a href="/page" use:active active-class="myactive">Link</a>

<!-- Valid HTML usage:
    if you prefer to have a valid HTML use `data-` prefix -->
<a href="/page" use:active data-exact data-active-class="myactive">Link</a>
```

## Redirects

You can redirect browser on any path using `redirect` property:

```html
<!-- Exact redirect-->
<Route path="/noenter" redirect="/newurl"/>

<!-- Non-exact redirect will work for any nested path also-->
<Route path="/noenter/*" redirect="/newurl"/>
```

Also you can redirect to relative path, just write new url withoud `/` symbol at start:

```html
<!-- This will redirect on /subpage/newurl -->
<Route path="/subpage/*">
    <Route path="/" redirect="newurl"/>
</Route>
```

## Fallbacks

The routes with `fallback` property shows their content when no matched address where found. Fallbacks may be placed inside non-exact `<Route>` only. Fallbacks are bubbling, so if there no fallback on current level, router will try to find fallback on any parent levels. See the example:

```html
<Route>  <!-- same as <Route path="/*"> -->
    <Route path="/">Root page</Route>
    <Route path="/page">Page</Route>
    <Route path="/sub1/*">
        <Route path="/subpage">Subpage1</Route>
    </Route>
    <Route path="/sub2/*">
        <Route path="/subpage">Subpage2</Route>
        <Route fallback>No subpage found</Route>
    </Route>
    <Route fallback>No page found</Route>
</Route>

<a href="/">...</a>               <!-- shows Root page -->
<a href="/page">...</a>           <!-- shows Page -->
<a href="/blah">...</a>           <!-- shows No page found -->
<a href="/sub1/subpage">...</a>   <!-- shows Subpage1 -->
<a href="/sub1/blah">...</a>      <!-- shows No page found -->
<a href="/sub1/blah/blah">...</a> <!-- shows No page found -->
<a href="/sub2/subpage">...</a>   <!-- shows Subpage2 -->
<a href="/sub2/blah">...</a>      <!-- shows No subpage found -->
<a href="/sub2/blah/blah">...</a> <!-- shows No subpage found -->
```

## Parameters

You can use param keys in `path` property. See the example:

```html
<Route path="/hello/:name" let:params>
    Hello, {params.name}
</Route>


<Route path="/books/:author/*" let:params>
    Books by {params.author}
    <Route path="/:genre" let:params>
        Books by {params.author} in category {params.genre}
    </Route>
</Route>
```

When you open `/books/stanislav_lem/fiction` in the browser, the `params`object will have the values retrived from the URL - `{author: "stanislav_lem"}` in the parent route and `{author: "stanislav_lem", genre: "fiction"}` in the child route. 

There are two ways to get parameters in nested component:

### Using `let:params` directive:
```html 
<!-- Hello.svelte-->
<script>
    export let name;
</script>

<h1>Hello, {name}!</h1>


<!-- App.svelte-->
...
<Route path="/hello/:name" let:params>
    <Hello name={params.name} />
</Route>
```

### Using `router` import:
```html 
<!-- Hello.svelte-->
<script>
    import {router} from 'tinro';
    let params = router.params();  
    // OR to force reactivity - $: params = router.params($router);
</script>

<h1>Hello, {params.name}!</h1>


<!-- App.svelte-->
...
<Route path="/hello/:name"><Hello /></Route>
```

## Navigation method

By default navigation uses `History API` which allows to use cleaner page URLs but need some setup on server side. Instead you may force to use `hash` navigation method. No need to change links or paths in your app, everything will works.

```html
<!-- Root file of yor project, ex. App.svelte -->
<script>
    import {Route,router} from 'tinro';
    router.useHashNavigation(); // enable hash navigation method
</script>

<!-- Link will point browser on '/#/page/subpage' -->
<a href="/page/subpage">Subpage</a>

<!-- Route shows content when URL is '/#/page/subpage' -->
<Route path="/page/subpage">Subpage content</Route>
```

### Server side setup for History API method

When you use History API and point browser on root path `/`(usually same as `/index.html`) all links and Routes will works properly. But when you start app on any subpage like `/page/subpage` you will see the `404 Not found` error. That is why you need setup your server to point all requests on `/index.html` file.

If you use [official Svelte template](https://github.com/sveltejs/template) it is easy. Open `package.json` file and find NPM script:

```json
"start": "sirv public"
```

Replace it with this line:

```json
"start": "sirv public --single"
```

Now start your app by `npm run dev` and open URL like `http://localhost:5000/page/subpage`. You should see the app page, instead "Not found" error.

*For other servers you can read following links: [Nginx](https://www.nginx.com/blog/creating-nginx-rewrite-rules/#Example&nbsp;%E2%80%93-Enabling-Pretty-Permalinks-for-WordPress-Websites),[Apache](https://httpd.apache.org/docs/2.4/rewrite/remapping.html#fallback-Resource), [Caddy](https://caddyserver.com/docs/caddyfile/directives/rewrite#examples)*



## API

You can import `router` object from the `tinro` package:

### `router.goto(href)`
Programaticly change the URL of current page.

### `router.params()`
Will return object with parameters if there are spcified in the path of current route. Will return `{}` if there no parameters in the URL.

### `router.subscribe(func)`
The `router` object is valid Svelte's store, so you can subscribe to get the navigation data changing. `func` gets an object with some page data:

* `path` - current browser URL
* `hash` - the hash part of the URL, after `#` sign
* `query` - object, containing parsed query string

Note, you can use the Svelte's autosubscription to retrieve data from the `router` store:

```html
<script>
    import {router} from 'tinro';
</script>

Current page URL is: {$router.path}
```

## Recipes

Tinro is not most powerful router among all available routers for the Svelte applications. We prefer smaller footprint in your bundles, than all possible features out the box. But you can easy realize some fetures yourself using recipies below:

### Lazy loading components

If you want have code-splitting and load components only when page requested, make this little component:

```html
<!-- Lazy.svelte-->
<script>
	export let component;
</script>

{#await component.then ? component : component()}
	 Loading component...
{:then Cmp}
   <svelte:component this={Cmp.default} />
{/await}
```

And use it when you need lazy loaded component in your routes:

```html
<Route path="/lazypage">
    <Lazy component={()=>import('./mypage.svelte')}/>
        <!-- OR -->
    <Lazy component={import('./mypage.svelte')}/>      
</Route>
```

### Transitions

In case of any transiton when path changes, make component like this:

```html
<!-- Transition.svelte -->
<script>
	import {router} from 'tinro';
	import {fade} from 'svelte/transition';
</script>

{#key $router.path}
<div in:fade="{{ duration: 700}}">
	<slot></slot>
</div>
{/key}
```

Then put you routes inside *Transition* component:

```html
<Transition> 
    <Route path="/">...</Route>
    <Route path="/page1">...</Route>
    <Route path="/page2">...</Route>
</Transition>
```

### Guarded routes

You may protect routes from being loaded just using Svelte's logic like `{#if}` statement:

```html
{#if user.authed}
    <Route path="/profile">This is private page...</Route>
{:else}
    <Route path="/profile"><a href="/login">Please sign in first</a></Route>
    <Route path="/login">This is sign in form...</Route>
{/if}
```

Also you can create special guard component as shown in [this example](https://svelte.dev/repl/5673ff403af14411b0cd1785be3d996f).


### Scroll on top

Tinro doesn't control scroll of the your app. Sometimes you need to scroll on top of the page when navigating between pages. Just add the `router` store subscription in your root component(ex. `App.svelte`). Using this way you can run any actions(not only a scroll), every time when `URL` changes.

```javascript
import {router} from `tinro`;
router.subscribe( _ => window.scrollTo(0, 0));
```