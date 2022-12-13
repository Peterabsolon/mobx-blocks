export interface ICollectionGenerics {
  /**
   * The type used for the identifier
   */
  id: number | string

  /**
   * The shape of the data being stored, must have an ID for lookups
   */
  data: { id: ICollectionGenerics["id"] }

  /**
   * The shape of query params used for the fetch API request
   * @example filters: { name: string }
   */
  filters: Record<string, any>

  /**
   * The keys of supported order columns
   * @example orderBy: 'id' | 'name'
   */
  orderBy?: string

  /**
   * The keys of supported order directions
   * @default 'asc' | 'desc'
   * @example 'ascending' | 'descending'
   */
  orderDirection?: string
}

export interface ICollectionGenericsDefaults {
  id: string
  data: { id: string }
  orderDirection: "asc" | "desc"
  filters: Record<string, any>
}

export interface ICollectionConfig<T extends ICollectionGenerics> {
  /**
   * The method through which the Collection fetches the data from your API
   */
  fetchFn: (
    queryParams: T["filters"] & {
      orderBy?: T["orderBy"]
      orderDirection?: T["orderDirection"]
      page?: number
      pageSize?: number
    }
  ) => Promise<TFetchFnResult<T>>

  /**
   * Optional method through which the Collection searches the data on your API
   */
  searchFn?: (query: string, filters?: T["filters"]) => Promise<T["data"][]>

  /**
   * Optional method to handle API request thrown errors, e.g. to render a toast notification
   */
  errorHandlerFn?: (err: unknown) => any

  /**
   * The default query params
   * @example { archived: false }
   */
  defaultFilters?: T["filters"]

  /**
   * Set page size to use
   * @default 20
   */
  pageSize?: number

  /**
   * If true, the fetch params are automatically synchronized to URL
   */
  syncParamsToUrl?: boolean
}

export interface IFetchFnOptions<IGenerics extends ICollectionGenerics> {
  /**
   * The params to perform the API request with.
   * By default the params are merged with params already present in state.
   */
  filters?: IGenerics["filters"]

  /**
   * The query to perform the API request with.
   * Gets parsed into params using 'query-string'
   */
  query?: string

  /**
   * If true, the existing params are cleared and only the passed in ones are used
   */
  clearFilters?: boolean

  /**
   * Set order by
   */
  orderBy?: IGenerics["orderBy"]

  /**
   * Set order direction
   */
  orderDirection?: IGenerics["orderDirection"]

  /**
   * The page to fetch
   */
  page?: number

  /**
   * The page size
   */
  pageSize?: number

  /**
   * If true, the caught exception from API request is rethrown after being set to state
   */
  shouldThrowError?: boolean
}

export type TFetchFnResult<T extends ICollectionGenerics> = {
  data: T["data"][]
  totalCount: number
}
