import {urlStore} from './url';              // curent path, query and hash
import {routesStore} from './routes';        // registered <Route> {id: [regexp,param_names]}
import {currentStore} from './current';      // object of <Route> ids, which matched with path {id: {...params}}

export const url = urlStore();
export const routes = routesStore();
export const current = currentStore(url,routes);