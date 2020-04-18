import {getContext} from 'svelte';
import {writable} from 'svelte/store';

export const router = routerStore();

function routerStore(){
    let hsh = window.location.pathname === 'srcdoc';

    const go = (href,set) => {
        hsh ? window.location.hash=href : history.pushState({}, '', href);
        set(getLocation(hsh));
    }

    const {subscribe,set} = writable(getLocation(hsh), _ => {
        window.hashchange = window.onpopstate = _ => set(getLocation(hsh));
        const un = aClickListener(href=>go(href,set));
        return _ => {
            window.hashchange = window.onpopstate = null;
            un();
        }
    }); 

    return {
        subscribe,
        goto: href => go(href,set),
        params: getParams,
        useHashNavigation: s => set(getLocation(hsh = s===undefined ? true : s))
    }
}

function getLocation(hsh){
    return hsh ? getLocationFromHash() : {
        path: window.location.pathname,
        query: query_parse(window.location.search.slice(1)),
        hash: window.location.hash.slice(1)
    }
}

function getLocationFromHash(){
    const match = String(window.location.hash.slice(1)||'/').match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);  
    return {
      path: match[1] || '',
      query: query_parse(match[2] || ''),
      hash: match[3] || '',
    };
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
    return getContext('R:p');
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