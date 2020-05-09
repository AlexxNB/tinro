import {router,getAttr} from './router.js';
export {router};

export function active(node){
    const href = getAttr(node,'href'),
          exact = getAttr(node,'exact',true),
          cl = getAttr(node,'active-class',true,'active');
          
    return {destroy:router.subscribe(r => {
        const data = getPathData(href,r.path); 
        data && (data.exact && exact || !exact) ? node.classList.add(cl) : node.classList.remove(cl);
    })}
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

export function getPathData(pattern,path){
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

    return {exact,params};
}

export function err(text){
    throw new Error(text);
}