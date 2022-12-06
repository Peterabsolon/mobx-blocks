export interface ICollectionGenerics {
  id: number | string
  data: { id: ICollectionGenerics["id"] }
}

export type TFetchParams = Record<string, any>

export interface ICollectionProps<IGenerics extends ICollectionGenerics> {
  fetchFn: (params?: TFetchParams) => Promise<IGenerics["data"][]>
  searchFn?: (query: string, params?: TFetchParams) => Promise<IGenerics["data"][]>
  errorHandlerFn?: (err: unknown) => any
}

export interface IFetchFnOptions {
  params?: TFetchParams
  shouldThrowError?: boolean
}

export interface ISetQueryParamsFnOptions {
  merge?: boolean
  fetch?: boolean
}
