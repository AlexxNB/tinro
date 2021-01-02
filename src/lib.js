import {getContext,setContext,onMount,tick} from 'svelte';
import {writable} from 'svelte/store';
import {router} from './router';

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


export function formatPath(path,slash=false){
    path = path.slice(
        path.startsWith('/#') ? 2 : 0,
        path.endsWith('/*') ? -2 : undefined
    )
    if(!path.startsWith('/')) path = '/'+path;
    if(path==='/') path = '';
    if(slash && !path.endsWith('/')) path += '/';
    return path;
}

export function getRouteMatch(pattern,path){
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

    return {
        exact,
        params,
        part:match[0].slice(0,-1)
    }
}

export function makeRedirectURL(path,parent_pattern,slug){
    if(slug === '') return path;
    if(slug[0] === '/') return slug;
    const getParts = url => url.split('/').filter(p=>p!=='');

    const pathParts = getParts(path);
    const patternParts = getParts(parent_pattern);

    return '/'+patternParts.map((_,i)=>pathParts[i]).join('/')+'/'+slug;
}

export function getAttr(node,attr,rm,def){
    const re = [attr,'data-'+attr].reduce( 
        (r,c) => {
            const a = node.getAttribute(c);
            if(rm) node.removeAttribute(c);
            return a === null ? r: a;
        },
    false );
    return !def && re === '' ? true : re ? re : def ? def : false;
}

export function parseQuery(str){
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

function err(text){
    throw new Error(text);
}