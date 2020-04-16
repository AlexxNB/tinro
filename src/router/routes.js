import {writable} from 'svelte/store';

export function routesStore(){
    const {subscribe,update} = writable({});
    
    return{
        subscribe,
        register: (pattern,id,exact,fallback)=>update(routes => {
            routes[id] = getRegExp(pattern,exact,fallback);
            return routes;
        })
    }
}

function getRegExp(pattern,exact,fallback){
    pattern = pattern.endsWith('/') ? pattern : pattern+'/';
    const params = [];
    let rx = pattern
       .split('/')
       .map(s => s.startsWith(':') ? (params.push(s.slice(1)),'([^\\/]+)') : s)
       .join('\\/');
    
    return [exact && !fallback ? `^${rx}$` : `^${rx}`,params,fallback];
  }

