import { makeAutoObservable } from "mobx"
import { Collection, CursorPagination } from "mobx-blocks"

import { api, IApiParams } from "../FakeApi"
import { IProduct } from "./Products.types"

class ProductsPageStore {
  products = new Collection({
    pagination: CursorPagination,
    pageSize: 5,
    sortBy: ["id", "name"] as const,
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
