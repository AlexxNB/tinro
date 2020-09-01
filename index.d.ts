/// <reference path="svelte.ext.d.ts" />

import type { SvelteComponent } from 'svelte'

interface TinroRoute {
    path: string
    query: Record<string, string>
    hash: string
}

declare interface TinroRouter {
    /** Point browser to the URL */
    goto(url: string): void
    /** Return current params from url */
    params(): Record<string, string>
    /** Use hash navigation instead history API */
    useHashNavigation(use?: boolean): void
    /** Get current route object on URL change */
    subscribe(handler: (currentRoute: TinroRoute) => void)
}

export const active: any
export const router: TinroRouter
export class Route {
    $$prop_def: {
      /**
       * Exact o relative path of the route
       * @default "/*"
       */
      path?: string;
  
      /**
       * Is route fallback
       * @default false
       */
      fallback?: boolean;

      /**
       * Redirect route to the specified path
       */
      redirect?: string;
    };
  
    $$slot_def: { default: {} };
  }
