import { makeAutoObservable } from "mobx"
import { Collection } from "mobx-blocks"

import { api } from "../FakeApi"

import { IProductsCollectionGenerics } from "./Products.types"

class ProductsPageStore {
  products = new Collection<IProductsCollectionGenerics>({
    fetchFn: (params) => api.getProducts(params),
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new ProductsPageStore()
