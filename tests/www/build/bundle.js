
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const router = routerStore();

    function routerStore(){
        const go = (href,set) => {history.pushState({}, '', href);set(getLocation());};

        const {subscribe,set} = writable(getLocation(), _ => {
            window.onpopstate = _ => set(getLocation());
            const un = aClickListener(href=>go(href,set));
            return _ => {
                window.onpopstate = null;
                un();
            }
        }); 

        return {
            subscribe,
            goto: href => go(href,set),
            params: getParams
        }
    }

    function getLocation(){
        return {
            path: window.location.pathname,
            query: query_parse(window.location.search.slice(1)),
            hash: window.location.hash.slice(1)
        }
    }

    function aClickListener(go){
        const h = e => {
            const a = e.target.closest('a[href]');
            if(a && /^\/$|^\/\w/.test(a.getAttribute('href'))) {
                e.preventDefault();
                go(a.getAttribute('href'));
            }
        };

        addEventListener('click', h);
        return () => removeEventListener('click', h);
    }

    function getParams(){
        return getContext('ROUTER:params');
    }

    function query_parse(str){
        const o= str.split('&')
          .map(p => p.split('='))
          .reduce((r,p) => {
              const name = p[0];
              if(!name) return r;
              let value = p.length > 1 ? p[p.length-1] : true;
              if(typeof value === 'string' && value.includes(',')) value = value.split(',');
              (r[name] === undefined) ? r[name]=[value] : r[name].push(value);
              return r;
          },{});
      
        return Object.entries(o).reduce((r,p)=>(r[p[0]]=p[1].length>1 ? p[1] : p[1][0],r),{});
      }

    function formatPath(path,slash=false){
        path = path.endsWith('/*') ? path.slice(0,-2) : path;
        path = path==='/' ? '' : path;
        if(slash && !path.endsWith('/')) path += '/';
        return path;
    }

    function getPathData(pattern,path){
        pattern = formatPath(pattern,true);
        path = formatPath(path,true);

        const keys = [];
        let params = {};
        let exact = true;
        let rx = pattern
           .split('/')
           .map(s => s.startsWith(':') ? (keys.push(s.slice(1)),'([^\\/]+)') : s)
           .join('\\/');

        let match = path.match(new RegExp(`^${rx}$`));
        if(!match) {
            exact = false;
            match = path.match(new RegExp(`^${rx}`));
        }
        if(!match) return null;
        keys.forEach((key,i) => params[key] = match[i+1]);

        return {exact,params};
    }

    function err(text){
        throw new Error(text);
    }

    /* cmp/Route.svelte generated by Svelte v3.20.1 */
    const get_default_slot_changes = dirty => ({ params: dirty & /*route*/ 1 });

    const get_default_slot_context = ctx => ({
    	params: /*route*/ ctx[0] ? /*route*/ ctx[0].params : {}
    });

    // (48:0) {#if show_content}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, route*/ 1025) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[10], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, get_default_slot_changes));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(48:0) {#if show_content}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*show_content*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show_content*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $router;
    	validate_store(router, "router");
    	component_subscribe($$self, router, $$value => $$invalidate(6, $router = $$value));
    	let { path = "/*" } = $$props;
    	let { fallback = false } = $$props;
    	let route = null;
    	let show_content = false;
    	let fallback_cb = null;
    	let childs = [];
    	let exact = fallback || !path.endsWith("/*");
    	const ctx = getContext("ROUTER:context");

    	if (ctx && (ctx.exact || ctx.fallback)) err(`${fallback ? "<Route fallback>" : `<Route path="${path}">`}  can't be placed inside ${ctx.fallback
	? "<Route fallback>"
	: `<Route path="${ctx.base || "/"}"> with exact path property`}`);

    	if (!ctx && fallback) err("<Route fallback> must be placed only inside <Route> with not exact path property");
    	path = formatPath(path);
    	if (ctx) path = ctx.base + path;
    	if (ctx && fallback) ctx.regFB(_ => $$invalidate(1, show_content = true));
    	const show_fallback = _ => fallback_cb ? fallback_cb() : ctx ? ctx.showFB() : null;

    	setContext("ROUTER:context", {
    		base: path,
    		exact,
    		fallback,
    		child: (show, path) => show
    		? childs.push(path)
    		: childs = childs.filter(e => e !== path),
    		regFB: func => fallback_cb = func,
    		showFB: show_fallback
    	});

    	afterUpdate(_ => route && !route.exact && !exact && childs.length === 0
    	? show_fallback()
    	: null);

    	const writable_props = ["path", "fallback"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("path" in $$props) $$invalidate(2, path = $$props.path);
    		if ("fallback" in $$props) $$invalidate(3, fallback = $$props.fallback);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		current_component,
    		getContext,
    		setContext,
    		afterUpdate,
    		router,
    		getPathData,
    		formatPath,
    		err,
    		path,
    		fallback,
    		route,
    		show_content,
    		fallback_cb,
    		childs,
    		exact,
    		ctx,
    		show_fallback,
    		$router
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(2, path = $$props.path);
    		if ("fallback" in $$props) $$invalidate(3, fallback = $$props.fallback);
    		if ("route" in $$props) $$invalidate(0, route = $$props.route);
    		if ("show_content" in $$props) $$invalidate(1, show_content = $$props.show_content);
    		if ("fallback_cb" in $$props) fallback_cb = $$props.fallback_cb;
    		if ("childs" in $$props) childs = $$props.childs;
    		if ("exact" in $$props) $$invalidate(7, exact = $$props.exact);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*path, $router*/ 68) {
    			 $$invalidate(0, route = getPathData(path, $router.path));
    		}

    		if ($$self.$$.dirty & /*route*/ 1) {
    			 setContext("ROUTER:params", route ? route.params : {});
    		}

    		if ($$self.$$.dirty & /*fallback, route*/ 9) {
    			 $$invalidate(1, show_content = fallback
    			? false
    			: !!route && (exact && route.exact || !exact));
    		}

    		if ($$self.$$.dirty & /*fallback, show_content, path*/ 14) {
    			 if (ctx && !fallback) ctx.child(show_content, path);
    		}
    	};

    	return [
    		route,
    		show_content,
    		path,
    		fallback,
    		fallback_cb,
    		childs,
    		$router,
    		exact,
    		ctx,
    		show_fallback,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { path: 2, fallback: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* tests/Child.svelte generated by Svelte v3.20.1 */
    const file = "tests/Child.svelte";

    function create_fragment$1(ctx) {
    	let h1;
    	let t1;
    	let h40;
    	let t3;
    	let pre0;
    	let t4_value = JSON.stringify(/*$router*/ ctx[1]) + "";
    	let t4;
    	let t5;
    	let h41;
    	let t7;
    	let pre1;
    	let t9;
    	let h42;
    	let t11;
    	let pre2;
    	let t12_value = JSON.stringify(/*params*/ ctx[0]) + "";
    	let t12;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "I'm child";
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = "Router contents";
    			t3 = space();
    			pre0 = element("pre");
    			t4 = text(t4_value);
    			t5 = space();
    			h41 = element("h4");
    			h41.textContent = "Params frome store";
    			t7 = space();
    			pre1 = element("pre");
    			pre1.textContent = `${JSON.stringify(/*r_params*/ ctx[2])}`;
    			t9 = space();
    			h42 = element("h4");
    			h42.textContent = "Params from let:params";
    			t11 = space();
    			pre2 = element("pre");
    			t12 = text(t12_value);
    			add_location(h1, file, 7, 0, 125);
    			add_location(h40, file, 9, 0, 145);
    			add_location(pre0, file, 10, 0, 170);
    			add_location(h41, file, 14, 0, 214);
    			add_location(pre1, file, 15, 0, 242);
    			add_location(h42, file, 19, 0, 287);
    			add_location(pre2, file, 20, 0, 319);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h40, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, pre0, anchor);
    			append_dev(pre0, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h41, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, pre1, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h42, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, pre2, anchor);
    			append_dev(pre2, t12);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$router*/ 2 && t4_value !== (t4_value = JSON.stringify(/*$router*/ ctx[1]) + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*params*/ 1 && t12_value !== (t12_value = JSON.stringify(/*params*/ ctx[0]) + "")) set_data_dev(t12, t12_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h40);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(pre0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h41);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(pre1);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h42);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(pre2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $router;
    	validate_store(router, "router");
    	component_subscribe($$self, router, $$value => $$invalidate(1, $router = $$value));
    	let { params = {} } = $$props;
    	let r_params = router.params();
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Child> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Child", $$slots, []);

    	$$self.$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({ router, Route, params, r_params, $router });

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("r_params" in $$props) $$invalidate(2, r_params = $$props.r_params);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [params, $router, r_params];
    }

    class Child extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Child",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get params() {
    		throw new Error("<Child>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Child>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* tests/App.svelte generated by Svelte v3.20.1 */
    const file$1 = "tests/App.svelte";

    // (18:2) <Route path="/">
    function create_default_slot_8(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main page");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(18:2) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (19:2) <Route path="/test1">
    function create_default_slot_7(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("TEST1");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(19:2) <Route path=\\\"/test1\\\">",
    		ctx
    	});

    	return block;
    }

    // (25:3) <Route path="/sub">
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("TEST2 SUBPAGE");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(25:3) <Route path=\\\"/sub\\\">",
    		ctx
    	});

    	return block;
    }

    // (26:3) <Route fallback>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("NOT FOUND SUB");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(26:3) <Route fallback>",
    		ctx
    	});

    	return block;
    }

    // (20:2) <Route path="/test2/*">
    function create_default_slot_4(ctx) {
    	let p;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let t4;
    	let current;

    	const route0 = new Route({
    			props: {
    				path: "/sub",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: {
    				fallback: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p = element("p");
    			a0 = element("a");
    			a0.textContent = "Test2 Subpage";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Test2 NoSubpage";
    			t3 = space();
    			create_component(route0.$$.fragment);
    			t4 = space();
    			create_component(route1.$$.fragment);
    			attr_dev(a0, "href", "/test2/sub");
    			add_location(a0, file$1, 21, 4, 428);
    			attr_dev(a1, "href", "/test2/sub3");
    			add_location(a1, file$1, 22, 4, 471);
    			add_location(p, file$1, 20, 3, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, a0);
    			append_dev(p, t1);
    			append_dev(p, a1);
    			insert_dev(target, t3, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(20:2) <Route path=\\\"/test2/*\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:2) <Route path="/hello/:name" let:params>
    function create_default_slot_3(ctx) {
    	let t0;
    	let t1_value = /*params*/ ctx[0].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("Hello, ");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*params*/ 1 && t1_value !== (t1_value = /*params*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(28:2) <Route path=\\\"/hello/:name\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (29:2) <Route path="/test4/:name" let:params>
    function create_default_slot_2(ctx) {
    	let current;

    	const child = new Child({
    			props: { params: /*params*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(child.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(child, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const child_changes = {};
    			if (dirty & /*params*/ 1) child_changes.params = /*params*/ ctx[0];
    			child.$set(child_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(child.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(child.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(child, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(29:2) <Route path=\\\"/test4/:name\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (30:2) <Route fallback>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("NOT FOUND");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(30:2) <Route fallback>",
    		ctx
    	});

    	return block;
    }

    // (17:1) <Route>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: {
    				path: "/test1",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route2 = new Route({
    			props: {
    				path: "/test2/*",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route3 = new Route({
    			props: {
    				path: "/hello/:name",
    				$$slots: {
    					default: [
    						create_default_slot_3,
    						({ params }) => ({ 0: params }),
    						({ params }) => params ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route4 = new Route({
    			props: {
    				path: "/test4/:name",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ params }) => ({ 0: params }),
    						({ params }) => params ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route5 = new Route({
    			props: {
    				fallback: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope, params*/ 3) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope, params*/ 3) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(17:1) <Route>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let p0;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;
    	let t9;
    	let a5;
    	let t11;
    	let a6;
    	let t13;
    	let p1;
    	let current;

    	const route = new Route({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "Test1";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Test2";
    			t3 = space();
    			a2 = element("a");
    			a2.textContent = "Test3";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Test4";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Test hello";
    			t9 = space();
    			a5 = element("a");
    			a5.textContent = "Ya";
    			t11 = space();
    			a6 = element("a");
    			a6.textContent = "Hash";
    			t13 = space();
    			p1 = element("p");
    			create_component(route.$$.fragment);
    			attr_dev(a0, "href", "/test1");
    			add_location(a0, file$1, 6, 1, 93);
    			attr_dev(a1, "href", "/test2");
    			add_location(a1, file$1, 7, 1, 121);
    			attr_dev(a2, "href", "/test3");
    			add_location(a2, file$1, 8, 1, 149);
    			attr_dev(a3, "href", "/test4/john");
    			add_location(a3, file$1, 9, 1, 177);
    			attr_dev(a4, "href", "/hello/world");
    			add_location(a4, file$1, 10, 1, 210);
    			attr_dev(a5, "href", "//ya.ru");
    			add_location(a5, file$1, 11, 1, 249);
    			attr_dev(a6, "href", "#huj");
    			add_location(a6, file$1, 12, 1, 275);
    			add_location(p0, file$1, 5, 0, 88);
    			add_location(p1, file$1, 15, 0, 305);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, a0);
    			append_dev(p0, t1);
    			append_dev(p0, a1);
    			append_dev(p0, t3);
    			append_dev(p0, a2);
    			append_dev(p0, t5);
    			append_dev(p0, a3);
    			append_dev(p0, t7);
    			append_dev(p0, a4);
    			append_dev(p0, t9);
    			append_dev(p0, a5);
    			append_dev(p0, t11);
    			append_dev(p0, a6);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p1, anchor);
    			mount_component(route, p1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route_changes.$$scope = { dirty, ctx };
    			}

    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p1);
    			destroy_component(route);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Route, Child });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    new App({
    	target: document.body,
    });

}());
//# sourceMappingURL=bundle.js.map
