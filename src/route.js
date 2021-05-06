import {hasContext,getContext,setContext,onMount,tick} from 'svelte';
import {writable} from 'svelte/store';
import {router} from './router';
import {err,formatPath,getRouteMatch,makeRedirectURL} from './lib';

const CTX = 'tinro';

const ROOT = {
    matched: true,
    childs: new Set(),
    activeChilds: new Set(),
    fallbacks: new Set(),
}

export function createRouteObject(options){

    const parent = getContext(CTX) || ROOT;

    if(parent.exact || parent.fallback)  err(
        `${options.fallback ? '<Route fallback>' : `<Route path="${options.path}">`}  can't be inside ${parent.fallback ? 
            '<Route fallback>' :
            `<Route path="${parent.path || '/'}"> with exact path` }`
    );

    const type = options.fallback ? 'fallbacks' : 'childs';

    const metaStore = writable({});

    const route = {
        router:{},
        exact: false,
        pattern: null,
        meta: {},
        parent,
        fallback: options.fallback,
        redirect: false,
        firstmatch: false,
        breadcrumb: null,
        matched: false,
        childs: new Set(),
        activeChilds: new Set(),
        fallbacks: new Set(),
        update(opts){
            route.exact = !opts.path.endsWith('/*');
            route.pattern = formatPath(`${route.parent.pattern || ''}${opts.path}`)
            route.redirect = opts.redirect;
            route.firstmatch = opts.firstmatch;
            route.breadcrumb = opts.breadcrumb;
            route.match();
        },
        register: () => {
            route.parent[type].add(route);
            return ()=>{
                route.parent[type].delete(route);
                route.router.un && route.router.un();
            }
        },
        show: ()=>{
            options.onShow();
            !route.fallback && route.parent.activeChilds.add(route);
        },
        hide: ()=>{
            options.onHide();
            !route.fallback && route.parent.activeChilds.delete(route);
        },
        match: async ()=>{
            route.matched = false;

            const {path,url,from,query} = route.router.location;
            const match = getRouteMatch(route.pattern,path);

            if(!route.fallback && match && route.redirect && (!route.exact || (route.exact && match.exact))){
                const nextUrl = makeRedirectURL(path,route.parent.pattern,route.redirect);
                return router.goto(nextUrl, true);
            }

            route.meta = match && {
                from,
                url,
                query,
                match: match.part,
                pattern: route.pattern,
                breadcrumbs: route.parent.meta && route.parent.meta.breadcrumbs.slice() || [],
                params: match.params,
                subscribe: metaStore.subscribe
            }

            route.breadcrumb && route.meta && route.meta.breadcrumbs.push({
                name: route.breadcrumb,
                path: match.part
            });

            metaStore.set(route.meta);

            if(
                match
                &&  !route.fallback  
                &&  (!route.exact || (route.exact && match.exact)) 
                &&  (!route.parent.firstmatch || !route.parent.matched)
            ){
                options.onMeta(route.meta);
                route.parent.matched = true;
                route.show();
            }else{
                route.hide();
            }

            await tick();
       
            if(
                match
                &&  !route.fallback
                &&  (
                        (route.childs.size > 0 && route.activeChilds.size == 0) ||
                        (route.childs.size == 0 && route.fallbacks.size > 0)
                    )
            ){
                let obj = route;
                while(obj.fallbacks.size == 0){
                    obj = obj.parent;
                    if(!obj) return;
                }
                obj && obj.fallbacks.forEach(fb => {
                    if(fb.redirect) {
                        const nextUrl = makeRedirectURL('/',fb.parent.pattern,fb.redirect);
                        router.goto(nextUrl, true);
                    } else {
                        fb.show();
                    }
                });
            }
        }
    }

    setContext(CTX,route);
    onMount(()=>route.register());

    route.router.un = router.subscribe(r => {
        route.router.location = r;
        if(route.pattern !== null) route.match();
    });
    
    return route;
}

export function getMeta(){
    return hasContext(CTX) 
        ? getContext(CTX).meta 
        : err('meta() function must be run inside any `<Route>` child component only');
}