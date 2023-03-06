export type TSortBy = "id" | "name"

export interface IApiParams {
  id?: string
  name?: string
  sortBy?: TSortBy
  sortAscending?: boolean
  page?: number
  pageSize?: number
}

export interface IApiParamsCursor extends Omit<IApiParams, "page"> {
  pageCursor: string | null
}
