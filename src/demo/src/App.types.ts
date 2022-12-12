export interface IProduct {
  id: string;
  name: string;
}

const PRODUCTS_SORT_BY = ["id", "name"] as const;

export type TProductsSortBy = typeof PRODUCTS_SORT_BY[number];

export const SORT_DIRECTION_PARAMS: [string, string] = [
  "ASCENDING",
  "DESCENDING",
];

export interface IProductsCollectionGenerics {
  id: string;
  data: IProduct;
  filters: {};
  orderBy: TProductsSortBy;
}
