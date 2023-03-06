import { makeAutoObservable } from "mobx"
import { Collection, CursorPagination } from "mobx-blocks"

import { cursorApi, IApiParamsCursor, TSortBy } from "../api"

class ProductsPageStore {
  products = new Collection({
    pagination: CursorPagination,
    pageSize: 5,
    sortBy: "id" as TSortBy,
    errorHandlerFn: (err) => console.log("[ProductsCollection] error: ", err),
    fetchFn: (params: IApiParamsCursor) => cursorApi.getProducts(params),
    searchFn: async (query) => {
      const res = await cursorApi.getProducts({ name: query, pageSize: 5, pageCursor: null })
      return res.data
    },
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new ProductsPageStore()
