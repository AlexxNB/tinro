import {writable} from 'svelte/store';

export function urlStore(){
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
        go: href => go(href,set)
    }
}

function getLocation(){
    return {
        path: window.location.pathname,
        query: window.location.search.slice(1),
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

