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
   */
  filters: Record<string, any>

  /**
   * The keys of supported order columns
   */
  orderBy: "id" | "name"

  orderDirection: "asc" | "desc"

  // searchParams: Record<string, any> // TODO?
}

export interface ICollectionProps<IGenerics extends ICollectionGenerics> {
  /**
   * The method through which the Collection fetches the data from your API
   */
  fetchFn: (filters?: IGenerics["filters"]) => Promise<IGenerics["data"][]>

  /**
   * Optional method through which the Collection searches the data on your API
   */
  searchFn?: (query: string, filters?: IGenerics["filters"]) => Promise<IGenerics["data"][]>

  /**
   * Optional method to handle API request thrown errors, e.g. to render a toast notification
   */
  errorHandlerFn?: (err: unknown) => any

  /**
   * The default query params
   */
  defaultFilters?: IGenerics["filters"]

  /**
   * If true, the fetch params are automatically synchronized to URL
   */
  syncParamsToUrl?: boolean
}

export interface IFetchFnOptions<TFilters> {
  /**
   * The params to perform the API request with.
   * By default the params are merged with params already present in state.
   */
  filters?: TFilters

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
   * If true, the caught exception from API request is rethrown after being set to state
   */
  shouldThrowError?: boolean
}
