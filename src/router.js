import {getContext} from 'svelte';
import {writable} from 'svelte/store';
import {getAttr,parseQuery,getRouteMatch} from './lib';

export const router = routerStore();

export function active(node){
    const href = getAttr(node,'href'),
          exact = getAttr(node,'exact',true),
          cl = getAttr(node,'active-class',true,'active');
          
    return {destroy:router.subscribe(r => {
        const match = getRouteMatch(href,r.path); 
        match && (match.exact && exact || !exact) ? node.classList.add(cl) : node.classList.remove(cl);
    })}
}

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
        meta: getMeta,
        useHashNavigation: s => set(getLocation(hsh = s===undefined ? true : s))
    }
}

let last;
function getLocation(hsh){
    return hsh ? getLocationHash() : getLocationHistory()
}

function getLocationHistory(){
    const from = last;
    const url = last = window.location.pathname+window.location.search;
    return {
        url,
        from,
        path: window.location.pathname,
        query: parseQuery(window.location.search.slice(1)),
        hash: window.location.hash.slice(1)
    }
}

function getLocationHash(){
    const from = last;
    const url = last = String(window.location.hash.slice(1)||'/');
    const match = url.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);  
    return {
      url,
      path: match[1] || '',
      query: parseQuery(match[2] || ''),
      hash: match[3] || '',
    };
}

function aClickListener(go){
    const h = e => {
        const a = e.target.closest('a[href]');
        const i = a && getAttr(a,'tinro-ignore');

        if(!i && a){
            const href = a.getAttribute('href').replace(/^\/#/,'');

            if(!/^\/\/|^[a-zA-Z]+:/.test(href)) {
                e.preventDefault();
                go(href.startsWith('/') ? href : a.href.replace(window.location.origin,''));
            }
        }
    }

    addEventListener('click', h);
    return () => removeEventListener('click', h);
}

function getMeta(){
    return getContext('tinro').meta;
}

function getParams(){
    return getContext('tinro').meta.params;
}
