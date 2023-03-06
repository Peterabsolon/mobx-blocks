import { makeAutoObservable } from "mobx"
import { Collection, CursorPagination } from "mobx-blocks"

import { api, IApiParams, TSortBy } from "../FakeApi"

class ProductsPageStore {
  products = new Collection({
    pagination: CursorPagination,
    pageSize: 5,
    sortBy: "id" as TSortBy,
    errorHandlerFn: (err) => console.log("[ProductsCollection] error: ", err),
    fetchFn: (params: IApiParams) => {
      console.log({ params })
      return api.getProducts(params)
    },
    searchFn: async (query) => {
      const res = await api.getProducts({ name: query, page: 1, pageSize: 5 })
      return res.data
    },
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new ProductsPageStore()
