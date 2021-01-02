# tinro

![npm](https://img.shields.io/npm/v/tinro?style=flat-square) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/AlexxNB/tinro/Publish%20on%20NPM?label=test&style=flat-square) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/tinro?label=Bundle%20size&style=flat-square) ![npm](https://img.shields.io/npm/dt/tinro?style=flat-square) 


The tinro is highly declarative, very tiny ([~3 Kb (1.8 Kb gzipped)](https://github.com/AlexxNB/tinro/blob/master/COMPARE.md)), dependency free router for [Svelte's](https://svelte.dev) web applications.

## Features

* Just one component to declare routes in your app
* Links are just common native `<a>` elements
* History API navigation or hash-navigation
* Simple nested routes
* Routes with parameters (`/hello/:name`)
* Redirects
* Fallbacks on any nested level
* Parsing query parameters (`?x=42&hello=world&fruits=apple,banana,orange`)
* [Svelte's REPL](https://svelte.dev/repl/4bc37ff40ada4111b71fe292a4eb90f6) compatible

## Documentation

* [Install](#install)
* [Getting started](#getting-started)
* [Nesting](#nesting)
* [Links](#links)
* [Redirects](#redirects)
* [Fallbacks](#fallbacks)
* [Route meta](#route-meta)
    - [url](#metaurl)
    - [pattern](#metapattern)
    - [match](#metamatch)
    - [from](#metafrom)
    - [params](#metaparams)
    - [breadcrumbs](#metabreadcrumbs)
* [~~Parameters~~ (Deprecated since 0.5.0)](#parameters)
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

**The tinro is very simple!** It provides just *one component* - `<Route>`. So a common app structure looks like:

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
See the example in action in [Svelte's REPL](https://svelte.dev/repl/4bc37ff40ada4111b71fe292a4eb90f6)

## Nesting

There are two types of routes you can declare in the `<Route>` component's `path` property:

### Exact path

Shows its content only when `path` matches the URL of the page *exactly*. You can't place nested `<Route>` components inside such components.

```html
<Route path="/">...</Route>
<Route path="/page">...</Route>
<Route path="/page/subpage">...</Route>
```

### Non-exact path

The `<Route>` components with a `path` property that ends with `/*` are showing their content when a part of the page's URL matches with path before the `/*`. You are able to place nested `<Routes>` inside components with non-exact path only.

```html
<Route path="/books/*">
    Books list:
    <Route path="/fiction">...</Route>
    <Route path="/drama">...</Route>
</Route>
```

The `path` property of the nested `<Routes>` is relative to its parent. So to see the _Fiction_ category in the above example - you should point your browser on `http://mysite.com/books/fiction`.

Nested routes inside child components do also work. So we can rewrite the example this way:

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

### Show first matched nested route only

Sometimes you need to show only first nested route from all matched with given URL. Use `firstmatch` property on parent `Route`:

```html
<Route path="/user/*" firstmatch>

    <!-- Will be open when URL is /user/add -->
    <Route path="/add">Add new user</Route> 

    <!-- Will be open when URL is /user/alex or /user/bob, but not /user/add -->
    <Route path="/:username" let:params>Show user {params.username}'s profile</Route> 

</Route>
```

## Links

There is no special component for links. Just use native `<a>` elements. When the `href` attribute starts with a single `/` sign (like `/mypage` or just `/`), it will be treated as internal link which will be matched with defined routes. Other cases do not affect the links' behavior. 

All internal links will be passed into the tinro router, but it is possible to prevent this by adding the `tinro-ignore` or `data-tinro-ignore` attributes:

```html
<a href="/api/auth" tinro-ignore>Go to API page</a>
```

In case you need to add the `active` class on the links where path is corresponding the current URL, use the `active` action from the `tinro` package:

```html
<script>
    import {active} from 'tinro';
</script>   

<!-- Common usage:
     class `active` will be added when URL is '/page' or any relative path like '/page/sub/sub' -->
<a href="/page" use:active>Link</a>

<!-- Exact match:
     class `active` will be added only when URL exactly equals '/page'  (but NOT '/page/sub') -->
<a href="/page" use:active exact>Link</a>

<!-- Custom class:
    class `myactive` will be added if link is active -->
<a href="/page" use:active active-class="myactive">Link</a>

<!-- Valid HTML usage:
    if you prefer to have valid HTML use `data-` prefix -->
<a href="/page" use:active data-exact data-active-class="myactive">Link</a>
```

## Redirects

You can redirect the browser on any path using `redirect` property:

```html
<!-- Exact redirect -->
<Route path="/noenter" redirect="/newurl"/>

<!-- Non-exact redirect will work for any nested path also -->
<Route path="/noenter/*" redirect="/newurl"/>
```

You can also redirect to a relative path, just write the new url without `/` symbol at start:

```html
<!-- This will redirect to /subpage/newurl -->
<Route path="/subpage/*">
    <Route path="/" redirect="newurl"/>
</Route>
```

## Fallbacks

The routes with the `fallback` property show their content when no matched address was found. Fallbacks may be placed inside a non-exact `<Route>` only. Fallbacks are bubbling, so if there is no fallback on the current level, the router will try to find a fallback on any parent levels. See the example:

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

## Route meta

There are some useful meta data you can get for each route.

You can get meta from `router` import:

```html 
<script>
    import {router} from 'tinro';
    const meta = router.meta();  
</script>

<h1>My URL is {meta.url}!</h1>

<!-- In case you need reactive updates, use it as a store -->
<h1>My URL is {$meta.url}!</h1>
```

Also you can get meta with `let:meta` directive:

```html 
<Route path="/hello" let:meta>
    <h1>My URL is {meta.url}!</h1>
</Route>
```

### `meta.url`

Current browser URL line (includes query). 

*Example: `/books/stanislaw_lem/page2?order=descend`*


### `meta.pattern`

The pattern of the route path which may includes parameters placeholders. It is combined from `path` property of all parent routes. 

*Example: `/books/:author`*

### `meta.match`

Part of browser URL which is matched with route pattern. 

*Example: `/books/stanislaw_lem`*

### `meta.from`

If present, value of browser URL before navigation on current page. Useful to make back button, for example.

*Example: `/books/stanislaw_lem/page1?order=descend`*

### `meta.query`

Object of values from browser URL query part (if present)

*Example: `{order: "descent"}`*

### `meta.params`

If route pattern has parameters, their values will be in `meta.params` object.

```html
<!-- Example for URL "/books/stanislaw_lem/solaris"> -->
<Route path="/books/:author/*" let:meta>

    <!-- meta.params here {author:stanislaw_lem} -->
    Author: {meta.params.author}

    <Route path="/:title" let:meta>

        <!-- meta.params here {author:stanislaw_lem, title:solaris} -->
        Book: {meta.params.title}

    </Route>
</Route>
```

### `meta.breadcrumbs`

All parent routes which have `breadcrumb` property will add breadcrumb in the `meta.breadcrumbs` array. Each breadcrumb is an object with `name` and `path` fields.


```html
<Route path="/*" breadcrumb="Home">
    <Route path="/portfolio" breadcrumb="My Portfolio" let:meta>
        <ul class="breadcrumbs">
        {#each meta.breadcrumbs as bc}
            <li><a href={bc.path}>{bc.name}</a></li>
        {/each}
        </ul>

        It is my portfolio
    </Route>
</Route>
```


## Parameters

> **!** *`route.params` and `let:params` are DEPRECATED since v.0.5.0. Will be deleted in future versions!*

See [meta.params](#metaparams) section

## Navigation method

By default navigation uses `History API` which allows to use cleaner page URLs but needs some setup on the server side. Instead you may force to use `hash` navigation method. No need to change links or paths in your app, everything will still work.

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

When you use History API and point the browser to root path `/`(usually same as `/index.html`) all links and Routes will work properly. But when you start your app on any subpage like `/page/subpage` you will see the `404 Not found` error. That is why you need to setup your server to point all requests to `/index.html`.

If you use [official Svelte template](https://github.com/sveltejs/template) it is easy. Open `package.json` file and find NPM script:

```json
"start": "sirv public"
```

Replace it with this line:

```json
"start": "sirv public --single"
```

Now start your app by `npm run dev` and open URL like `http://localhost:5000/page/subpage`. You should see the app page, instead of the "Not found" error.

*For other servers you can read the following links: [Nginx](https://www.nginx.com/blog/creating-nginx-rewrite-rules/#Example&nbsp;%E2%80%93-Enabling-Pretty-Permalinks-for-WordPress-Websites),[Apache](https://httpd.apache.org/docs/2.4/rewrite/remapping.html#fallback-Resource), [Caddy](https://caddyserver.com/docs/caddyfile/directives/rewrite#examples)*



## API

You can import `router` object from the `tinro` package:

### `router.goto(href)`
Programaticly change the URL of current page.

### `router.meta()`
Run it inside any `Route` component to get its  meta data which includes:

* `url` - current browser URL(with query string)
* `from` - previous URL before navigation on current page, if present
* `pattern` - route's path pattern combined from all `path` properties of all parent `Route` components.
* `match` - part of browser URL, which is matched with pattern.
* `params` - if pattern has placeholders, their values will be in this object
* `query` - if browser URL has query string, there will be parsed object
* `breadcrumbs` - all parent routes with `breadcrumb` property will add the object like `{name,path}` in this array
* `subscribe(func)` -  you can use it to subscribe for meta data changes. The `func` will get updated `meta` object each time, URL changes.

### `router.params()`
Deprecated. See `router.meta` instead.

### `router.subscribe(func)`
The `router` object is valid Svelte's store, so you can subscribe to get the navigation data changing. `func` gets an object with some page data:

* `url` - current browser URL(with query string)
* `from` - previous URL before navigation on current page, if present
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

Tinro is not the most powerful router among all available routers for Svelte applications. We prefer a smaller footprint in your bundles over all possible features out the box. But you can easily code some features yourself using the recipies below:

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

In case of any transiton when path changes, create a component like this:

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

Then put your routes inside the *Transition* component:

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

Also you can create a special guard component as shown in [this example](https://svelte.dev/repl/5673ff403af14411b0cd1785be3d996f).


### Scroll on top

Tinro doesn't control scrolling of your app. Sometimes you need to scroll on top of the page when navigating between pages. Just add the `router` store subscription in your root component(ex. `App.svelte`). Using this way you can run any actions (not only scrolling), every time the `URL` changes.

```javascript
import {router} from `tinro`;
router.subscribe( _ => window.scrollTo(0, 0));
```
