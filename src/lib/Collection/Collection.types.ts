import { ICursorPaginationParams, CursorPagination } from "../CursorPagination"
import { IPaginationParams, Pagination } from "../Pagination"
import type { ISortingParams } from "../Sorting"

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
   * @example sortBy: 'id' | 'name'
   */
  sortBy?: string

  /**
   * Module to handle pagination with
   */
  pagination?: Pagination | CursorPagination
}

export interface ICollectionGenericsDefaults {
  id: string
  data: { id: string }
  orderDirection: "asc" | "desc"
  filters: Record<string, any>
}

export interface ICollectionConfig<
  TItem,
  TFilters extends Record<string, any>,
  TSortBy extends string | undefined,
  TPagination extends typeof Pagination | typeof CursorPagination | undefined
> {
  /**
   * Pagination module imported from "mobx-blocks"
   * @example pagination: new Pagination()
   * @example pagination: new CursorPagination()
   */
  pagination?: TPagination

  /**
   * The method through which the Collection fetches the data from your API
   */
  fetchFn: (
    queryParams: TFilters &
      ISortingParams<TSortBy> &
      (TPagination extends typeof Pagination
        ? IPaginationParams
        : TPagination extends typeof CursorPagination
        ? ICursorPaginationParams
        : IAnyObject)
  ) => Promise<
    TPagination extends typeof CursorPagination
      ? { data: TItem[]; nextPageCursor: string | undefined; prevPageCursor?: string }
      : { data: TItem[]; totalCount: number }
  >

  /**
   * Optional method through which the Collection searches the data on your API
   */
  searchFn?: (query: string, filters?: TFilters) => Promise<TItem[]>

  /**
   * Optional method to handle API request thrown errors, e.g. to render a toast notification
   */
  errorHandlerFn?: (err: unknown) => any

  /**
   * The default query params
   * @example { archived: false }
   */
  initialFilters?: TFilters

  /**
   * Set page size to use
   * @default 20
   */
  pageSize?: number

  /**
   * If true, the fetch params are automatically synchronized to URL
   */
  syncParamsToUrl?: boolean

  /**
   * The keys of supported order columns
   * @example sortBy: 'id' | 'name'
   */
  sortBy?: TSortBy
}

export interface IFetchFnOptions<
  TFilters extends Record<string, any>,
  TSortBy extends string | undefined
> {
  /**
   * The params to perform the API request with.
   * By default the params are merged with params already present in state.
   */
  filters?: Partial<TFilters>

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
  sortBy?: TSortBy

  /**
   * Set sort direction; true = ascending, false = descending
   */
  sortAscending?: boolean

  /**
   * If true, the caught exception from API request is rethrown after being set to state
   */
  shouldThrowError?: boolean

  /**
   * Page to fetch
   */
  page?: number

  /**
   * Page size to use
   */
  pageSize?: number

  /**
   * If using cursor based pagination, the page cursor
   */
  pageCursor?: string
}

export interface IFetchFnCursorOptions<
  TFilters extends Record<string, any>,
  TSortBy extends string | undefined
> extends IFetchFnOptions<TFilters, TSortBy> {
  pageCursor?: string
}

export type TFetchFnResult<TItem> = {
  data: TItem[]
  totalCount: number
}

export type TFetchCursorFnResult<TItem> = {
  data: TItem[]
  nextPageCursor?: string
}
