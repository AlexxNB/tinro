interface TinroRoute<T = Record<string, string>> {
    url: string
    from: string
    path: string
    query: T
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

interface TinroRouterModeSwitcher {
  /** Set HistoryAPI navigation method */
  history(): ()=>void
  /** Set hash navigation method */
  hash(): ()=>void
  /** Set memory navigation method */
  memory(): ()=>void
}

declare interface TinroRouter {
    /** Point browser to the URL */
    goto(url: string): void
    /** Return current meta for the route */
    meta(): TinroRouteMeta
    /** Get current route object on URL change */
    subscribe(handler: (currentRoute: TinroRoute) => void)
    /** Switch navigatin method */
    mode: TinroRouterModeSwitcher

    /** DEPRECATED: Use router.meta().params instead */
    params(): Record<string, string>
    /** DEPRECATED: Use router.mode.hash() instead*/
    useHashNavigation(use?: boolean): void
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
      /** DEPRECATED: Use meta.params instead */
      params: Record<string, string>
    } };
  }
