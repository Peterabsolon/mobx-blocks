import { makeAutoObservable } from "mobx"
import { Collection, CursorPagination } from "mobx-blocks"

import { cursorApi, IApiParams, IApiParamsCursor, TSortBy } from "../api"

class ProductsPageStore {
  products = new Collection({
    pagination: CursorPagination,
    pageSize: 30,
    sortBy: "id" as TSortBy,
    initialFilters: {} as IApiParams,
    errorHandlerFn: (err) => {
      console.log("[ProductsCollection] error: ", err)
    },
    fetchFn: (params: IApiParamsCursor) => {
      console.log("[ProductsCollection] fetchFn() params: ", params)
      return cursorApi.getProducts(params)
    },
    searchFn: async (query) => {
      console.log("[ProductsCollection] searchFn() query: ", query)
      const res = await cursorApi.getProducts({ name: query, pageSize: 5, pageCursor: null })
      return res.data
    },
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new ProductsPageStore()
