import {getContext} from 'svelte';
import {writable} from 'svelte/store';

export const router = routerStore();

function routerStore(){
    const go = (href,set) => {history.pushState({}, '', href);set(getLocation())}

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
    }

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