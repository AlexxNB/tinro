import MODES from './modes';
import {parseQuery,makeQuery,prefix} from './lib';

let memoURL;
let from;
let last;

export const location = createLocation();

function createLocation(){
    let MODE = MODES.getDefault();

    let listener;

    const reset = _ => window.onhashchange = window.onpopstate = memoURL = null;
    const dispatch = _ => listener && listener(readLocation(MODE));

    function setMode(newMode){
        newMode && (MODE = newMode);
        reset();
        MODE !== MODES.OFF 
        && MODES.run( MODE ,
            _ => window.onpopstate = dispatch,
            _ => window.onhashchange = dispatch
        )
        && dispatch()
    }

    return {
        mode: mode => setMode(mode),
        get: _ => readLocation(MODE),
        go(href,replace){
            writeLocation(MODE,href,replace);
            dispatch();
        },
        start(fn){
            listener = fn;
            setMode()
        },
        stop(){
            listener = null;
            setMode(MODES.OFF)
        },
        set(parts){
            const loc = Object.assign(readLocation(MODE),parts);
            this.go(loc.path + prefix(makeQuery(loc.query),'?') + prefix(loc.hash,'#'), !parts.path);
        }
    }
}

function writeLocation(MODE, href, replace){
    if(!replace) from=last;
       
    const setURL = (url) => history[replace ? 'replaceState' : 'pushState']({}, '', url);

    MODES.run( MODE,
        _ => setURL(href),
        _ => setURL(`#${href}`),
        _ => memoURL = href
    );
}

function readLocation(MODE){
    
    const url = MODES.run( MODE,
        _ => window.location.pathname+window.location.search+window.location.hash,
        _ => String(window.location.hash.slice(1)||'/'),
        _ => memoURL || '/'
    );

    const match = url.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);

    last=url;
  
    return {
        url,
        from,
        path: match[1] || '',
        query: parseQuery(match[2] || ''),
        hash: match[3] || '',
    };
}