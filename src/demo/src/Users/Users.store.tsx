import { makeAutoObservable } from "mobx"
import { Collection } from "mobx-blocks"

import { api, IApiParams } from "../FakeApi"

class UsersPageStore {
  users = new Collection({
    fetchFn: (params: IApiParams) => api.getUsers(params),
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new UsersPageStore()
