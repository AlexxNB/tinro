interface TinroRoute {
    url: string
    from: string
    path: string
    query: Record<string, string>
    hash: string
}

interface TinroBreadcrumb {
  url: string
  name: string
}

interface TinroRouteMeta {
  url: string
  from?: string
  match: string
  pattern: string
  breadcrumbs?: Array<TinroBreadcrumb>
  query: Record<string, string>
  params: Record<string, string>
  subscribe(handler: (meta: TinroRouteMeta) => void)
}

declare interface TinroRouter {
    /** Point browser to the URL */
    goto(url: string): void
    /** Return current meta for the route */
    meta(): TinroRouteMeta
    /** DEPRECATED: Return current params from url */
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

      /**
       * Will be show only first matched with URL nested route
       * @default false
       */
      firstmatch?: boolean;

      /**
       * Name of the route to use in breadcrumbs
       * @default null
       */
      breadcrumb?: string;
    };
  
    $$slot_def: { default: {
      /** Current meta for the route */
      meta: TinroRouteMeta
      /** DEPRECATED: Current params from url */
      params: Record<string, string>
    } };
  }
