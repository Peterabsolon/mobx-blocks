export interface IProduct {
  id: string
  name: string
}

const PRODUCTS_SORT_BY = ["id", "name"] as const

export type TProductsSortBy = (typeof PRODUCTS_SORT_BY)[number]

export interface IProductsFilters {
  id?: number
  name?: string
}

export interface IProductsCollectionGenerics {
  id: string
  data: IProduct
  filters: IProductsFilters
  orderBy: TProductsSortBy
  orderDirection: "ASCENDING" | "DESCENDING"
}
