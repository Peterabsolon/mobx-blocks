import { omit } from "lodash"
import qs from "qs"

export const parseQueryString = <TSortBy extends string, TFilters extends Record<string, any>>(
  query?: string
) => {
  // Remove leading ? so ?page=1 gets parsed to page=1
  const queryClean = query?.indexOf("?") === 0 ? query.slice(1, query.length) : query

  const params = qs.parse(queryClean || "")

  let sortBy: TSortBy | undefined
  let sortAscending: boolean | undefined
  let page: number | undefined
  let pageSize: number | undefined
  let pageCursor: string | undefined

  if (Object.keys(params).length > 0) {
    if (typeof params.sortBy === "string") {
      sortBy = params.sortBy as TSortBy
    }

    if (typeof params.sortAscending === "string") {
      sortAscending = params.sortAscending === "true"
    }

    if (typeof params.page === "string") {
      page = Number(params.page)
    }

    if (typeof params.pageSize === "string") {
      pageSize = Number(params.pageSize)
    }

    if (typeof params.pageCursor === "string") {
      pageCursor = params.pageCursor
    }
  }

  // Everything else is a filter
  const filters = omit(params, ["sortBy", "sortAscending", "page", "pageSize"]) as TFilters

  return {
    sortBy,
    sortAscending,
    page,
    pageSize,
    pageCursor,
    filters,
  }
}
