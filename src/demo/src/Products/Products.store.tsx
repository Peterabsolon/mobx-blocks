import { makeAutoObservable } from "mobx"
import { Collection, CursorPagination, Cache } from "mobx-blocks"

import { cursorApi, IApiParams, TSortBy } from "../api"

import { IProduct } from "./Products.types"

class ProductsPageStore {
  cache = new Cache<IProduct>({ ttl: 5 })

  products = new Collection({
    cache: this.cache,
    pagination: CursorPagination,
    pageSize: 30,
    sortBy: "id" as TSortBy,
    initialFilters: {} as IApiParams,

    errorHandlerFn: (err) => {
      console.log("[ProductsCollection] error: ", err)
    },

    fetchFn: async (params) => cursorApi.getProducts(params),

    fetchOneFn: async (id) => cursorApi.getProductById(id),

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
