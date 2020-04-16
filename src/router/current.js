import {derived} from 'svelte/store';

export function currentStore(url,routes){
    return derived([url,routes],([$url,$routes]) => {
        console.log($routes);
        let routes =  Object.entries($routes)
            .reduce((o,[id,rx,fb])=>{
                if(fb) return o;
                const parsed = parsePath($url.path,rx);
                return parsed ? (o[id]=parsed,o) : o;
            },{});
        if(Object.keys(routes).length === 0) routes =  Object.entries($routes)
        .reduce((o,[id,rx,fb])=>{
            if(!fb) return o;
            const parsed = parsePath($url.path,rx);
            return parsed ? (o[id]=parsed,o) : o;
        },{});
        return routes;
    });
}

function parsePath(path,pattern){
    path = path.endsWith('/') ? path : path+'/';
    const match = path.match(new RegExp(pattern[0]));
    let params = {};
    if(match){ 
      pattern[1].forEach((key,i) => params[key] = match[i+1]);
      return params;
    }
    return false;
  }