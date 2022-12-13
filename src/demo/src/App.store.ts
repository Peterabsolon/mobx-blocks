import { makeAutoObservable } from "mobx"

type TPage = "products" | "users"

class AppStore {
  page: TPage = "products"

  constructor() {
    makeAutoObservable(this)
  }

  setPage = (page: TPage) => {
    this.page = page
  }
}

export const app = new AppStore()
