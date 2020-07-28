import type {SvelteComponent} from 'svelte'

declare interface tinroRoute {
    path: string;
    query: Object;
    hash: string;
}

declare function tinroRouterHandler(current_route:tinroRoute): void;
declare function tinroActiveAction(node:any):any;

declare interface tinroRouter {
    /** Point browser to the URL*/
    goto(url:string): void;
    /** Return current params from url*/
    params(): Object;
    /** Use hash navigation instead history API*/
    useHashNavigation(use?: boolean): void;
    /** Get current route object on URL change*/
    subscribe(handler: typeof tinroRouterHandler)
}

declare module 'tinro' {
    export const router: tinroRouter
    export const active: typeof tinroActiveAction
    export class Route extends SvelteComponent {
        $$prop_def: any
    }
}