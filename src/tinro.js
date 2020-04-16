export {url,routes,current} from './router';

export function formatPath(path,slash=false){
    path = path.endsWith('/*') ? path.slice(0,-2) : path;
    path = path==='/' ? '' : path;
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