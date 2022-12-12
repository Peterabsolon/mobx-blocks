import { makeAutoObservable } from "mobx"
import { Collection } from "@peterabsolon/mobx-awesome-query"

import { IProductsCollectionGenerics, SORT_DIRECTION_PARAMS } from "./App.types"
import { api } from "./FakeApi"

class AppStore {
  products = new Collection<IProductsCollectionGenerics>({
    fetchFn: () => api.getProducts(),
    sortDirectionParams: SORT_DIRECTION_PARAMS,
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const app = new AppStore()
