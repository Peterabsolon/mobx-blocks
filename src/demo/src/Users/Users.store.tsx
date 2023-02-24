import { makeAutoObservable } from "mobx"
import { Collection } from "mobx-blocks"

import { api, IApiParams, TSortBy } from "../FakeApi"
import { IUser } from "./Users.types"

class UsersPageStore {
  users = new Collection<IUser, IApiParams, TSortBy>({
    fetchFn: (params) => api.getUsers(params),
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new UsersPageStore()
