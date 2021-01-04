import {getContext,setContext,onMount,tick} from 'svelte';
import {writable} from 'svelte/store';
import {router} from './router';
import {err,formatPath,getRouteMatch,makeRedirectURL} from './lib';

export function createRouteObject(options){

    const parent = getContext('tinro');

    if(parent && (parent.exact || parent.fallback) ) err(
        `${options.fallback ? '<Route fallback>' : `<Route path="${options.path}">`}  can't be inside ${parent.fallback ? 
            '<Route fallback>' :
            `<Route path="${parent.path || '/'}"> with exact path` }`
    );

    const type = options.fallback ? 'fallbacks' : 'childs';

    const metaStore = writable({});

    const route = {
        un:null,
        exact: false,
        pattern: '',
        meta: {},
        parent,
        fallback: options.fallback,
        redirect: options.redirect,
        firstmatch: options.firstmatch,
        matched: false,
        childs: new Set(),
        activeChilds: new Set(),
        fallbacks: new Set(),
        makePattern(path){
            route.exact = !path.endsWith('/*');
            route.pattern = formatPath(`${route.parent && route.parent.pattern || ''}${path}`)
        },
        register: () => {
            if(!route.parent) return;
            route.parent[type].add(route);
            return ()=>{
                route.parent[type].delete(route);
                route.un && route.un();
            }
        },
        show: ()=>{
            options.onShow();
            !route.fallback && route.parent && route.parent.activeChilds.add(route);
        },
        hide: ()=>{
            options.onHide();
            !route.fallback && route.parent && route.parent.activeChilds.delete(route);
        },
        match: async ({path,url,from,query})=>{
            route.matched = false;
            const match = getRouteMatch(route.pattern,path);

            if(match && route.redirect && (!route.exact || (route.exact && match.exact))){
                return router.goto(makeRedirectURL(path,route.parent.pattern,route.redirect));
            }

            route.meta = match && {
                from,
                url,
                query,
                match: match.part,
                pattern: route.pattern,
                breadcrumbs: route.parent && route.parent.meta && route.parent.meta.breadcrumbs.slice() || [],
                params: match.params,
                subscribe: metaStore.subscribe
            }

            options.breadcrumb && route.meta && route.meta.breadcrumbs.push({
                name: options.breadcrumb,
                path: match.part
            });

            metaStore.set(route.meta);

            if(
                match
                &&  !route.fallback  
                &&  (!route.exact || (route.exact && match.exact)) 
                &&  (!route.parent || !route.parent.firstmatch || !route.parent.matched)
            ){
                options.onMeta(route.meta);
                route.parent && (route.parent.matched = true);
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
                obj && obj.fallbacks.forEach(fb => fb.show());
            }
        }
    }

    route.makePattern(options.path);

    setContext('tinro',route);
    onMount(()=>route.register());

    route.un = router.subscribe(r => {
        route.match(r);
    });
    
    return route;
}