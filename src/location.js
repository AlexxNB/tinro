import MODES from './modes';
import {parseQuery} from './lib';

let last;
let memoURL;

export const location = createLocation();

function createLocation(){
    let MODE = MODES.getDeafault();
    let listener;
    
    const reset = _ => window.onhashchange = window.onpopstate = memoURL = null;
    const dispatch = _ => listener && listener(getLocation(MODE));

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
        get: _ => getLocation(MODE),
        go(href){
            setLocation(MODE,href);
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
    }
}

function setLocation(MODE,href){
    MODES.run( MODE,
        _ => history.pushState({}, '', href),
        _ => window.location.hash=href,
        _ => memoURL=href
    );
}

function getLocation(MODE){
    const from = last;
    const url = last = MODES.run( MODE,
        _ => window.location.pathname+window.location.search,
        _ => String(window.location.hash.slice(1)||'/'),
        _ => memoURL || '/'
    );

    const match = url.match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);

    return {
        url,
        from,
        path: match[1] || '',
        query: parseQuery(match[2] || ''),
        hash: match[3] || '',
      };
}