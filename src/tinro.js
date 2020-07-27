import {router,active} from './router.js';
import {routes,registerRouteObject} from './routes.js';

export {router,routes,registerRouteObject,active};

router.subscribe(r => {
    routes.setPath(r.path);
})