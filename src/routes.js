import {onMount, onDestroy, getContext,setContext} from 'svelte';
import {writable} from 'svelte/store';
import {getPathData,formatPath,makeRedirectURL,err} from './lib';
import {router} from './router';

let ids = 0;

export const routes = routesStore();

export function registerRouteObject({path,fallback,redirect,onShow,onHide,onParams}){

    const exact = fallback || !path.endsWith('/*'); 
    path = formatPath(path);
    const parent = (getContext('_') || {pattern:''});
    const pattern = parent.pattern + path;

    if(parent.exact || parent.fallback ) err(
        `${fallback ? '<Route fallback>' : `<Route path="${path}">`}  can't be inside ${parent.fallback ? 
            '<Route fallback>' :
            `<Route path="${parent.path || '/'}"> with exact path` }`
    );

    const routeObject = {
        id: ids++,
        parent,
        pattern,
        exact,
        fallback,
        redirect,
        active: false,
        params: {},
        show(){
            this.active = true;
            onShow();
        },
        hide(){
            this.active = false;
            onHide();
        },
        setParams(obj){
            this.params = obj;
            onParams(obj)
        }
    }

    setContext('_',routeObject);
    onMount(_ => routes.add(routeObject));
    onDestroy(_ => routes.remove(routeObject));
}

function routesStore(){
    let routes = [];
    let fallbacks = {}
    let path = '';

    let {subscribe,set} = writable(routes);

    const updateRoutes = () => {

        // Hide all fallbacks
        for(let id in fallbacks)
        for(let fb of fallbacks[id]){
            fb.hide();
        }

        // Show all routes with patterns corresponding current url
        for(let route of routes){
            const data = getPathData(route.pattern,path);
            if(data && ( (data.exact && route.exact) || !route.exact ) ){
                if(route.redirect){
                    return router.goto(makeRedirectURL(path,route.parent.pattern,route.redirect));
                }
                route.setParams(data.params);
                route.show();
            }else{
                route.hide();
            }
        }
        
        //Find all non-exact routes without child routes
        const emptyRoutes = routes.filter(notExact=>{
            return notExact.active 
                && !notExact.exact 
                && routes.filter(childs => {
                    return childs.active  && childs.parent.id === notExact.id
                }).length === 0
        });

        // Show fallbacks for each empty route
        for(let empty of emptyRoutes){
            while(empty.id !== undefined){
                if(fallbacks[empty.id]){
                    for(let fb of fallbacks[empty.id]){
                        fb.show();
                    }
                    break;
                }
                empty = empty.parent;
            }
        }       
    }

    subscribe(updateRoutes);

    return {
        subscribe,
        add(routeObject){
            if(routeObject.fallback){
                if(fallbacks[routeObject.parent.id])
                   fallbacks[routeObject.parent.id].push(routeObject);
                else
                   fallbacks[routeObject.parent.id]=[routeObject];
            } 
            else
                routes.push(routeObject);
            set(routes);
        },
        remove(routeObject){
            if(routeObject.fallback){
                if(fallbacks[routeObject.parent.id])
                   fallbacks[routeObject.parent.id]=fallbacks[routeObject.parent.id].filter(o=>o!==routeObject);  
            } else
                routes = routes.filter(o => o !== routeObject);
            set(routes);
        },
        setPath(newpath){
            path=newpath;
            updateRoutes();
        }
    }
}