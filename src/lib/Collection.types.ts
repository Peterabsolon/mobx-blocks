export interface ICollectionGenerics {
  id: number | string
  data: { id: ICollectionGenerics["id"] }
}

export interface ICollectionProps<IGenerics extends ICollectionGenerics> {
  fetchFn: (params?: Record<string, any>) => Promise<IGenerics["data"][]>
  searchFn?: (query: string, params?: Record<string, any>) => Promise<IGenerics["data"][]>
}

export interface IInitFnOptions {
  params?: Record<string, any>
  shouldThrowError?: boolean
}
