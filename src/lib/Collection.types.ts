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
   * The shape of params used for the fetch API request
   */
  fetchParams: Record<string, any>

  // searchParams: Record<string, any> // TODO?
}

export interface ICollectionProps<IGenerics extends ICollectionGenerics> {
  /**
   * The method through which the Collection fetches the data from your API
   */
  fetchFn: (params?: IGenerics["fetchParams"]) => Promise<IGenerics["data"][]>

  /**
   * Optional method through which the Collection searches the data on your API
   */
  searchFn?: (query: string, params?: IGenerics["fetchParams"]) => Promise<IGenerics["data"][]>

  /**
   * Optional method to handle API request thrown errors, e.g. to render a toast notification
   */
  errorHandlerFn?: (err: unknown) => any

  /**
   * The default fetch query params
   */
  defaultQueryParams?: IGenerics["fetchParams"]

  /**
   * If true, the fetch params are automatically synchronized to URL
   */
  syncParamsToUrl?: boolean
}

export interface IFetchFnOptions<TFetchParams> {
  /**
   * The params to perform the API request with.
   * By default the params are merged with params already present in state.
   */
  params?: TFetchParams

  /**
   * If true, the existing params are cleared and only the passed in ones are used
   */
  clearParams?: boolean

  /**
   * If true, the caught exception from API request is rethrown after being set to state
   */
  shouldThrowError?: boolean
}
