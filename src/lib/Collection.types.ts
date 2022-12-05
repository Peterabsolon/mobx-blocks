export interface TCollectionGenerics {
  id: number | string
  data: { id: TCollectionGenerics["id"] }
}

export interface ICollectionProps<IGenerics extends TCollectionGenerics> {
  fetchFn: () => Promise<IGenerics["data"][]>
}

export interface IInitFnOptions {
  shouldThrowError?: boolean
}
