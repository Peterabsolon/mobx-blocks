export interface ICollectionGenerics {
  id: number | string
  data: { id: ICollectionGenerics["id"] }
  fetchParams: Record<string, any>
}

export interface ICollectionProps<IGenerics extends ICollectionGenerics> {
  fetchFn: (params?: IGenerics["fetchParams"]) => Promise<IGenerics["data"][]>
  searchFn?: (query: string, params?: IGenerics["fetchParams"]) => Promise<IGenerics["data"][]>
  errorHandlerFn?: (err: unknown) => any
}

export interface IFetchFnOptions<TFetchParams> {
  params?: TFetchParams
  shouldThrowError?: boolean
}

export interface ISetQueryParamsFnOptions {
  merge?: boolean
  fetch?: boolean
}
