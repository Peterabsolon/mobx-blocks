import { makeAutoObservable } from "mobx"
import { Collection } from "mobx-blocks"

import { api } from "../FakeApi"

import { IUsersCollectionGenerics } from "./Users.types"

class UsersPageStore {
  users = new Collection<IUsersCollectionGenerics>({
    fetchFn: (params) => api.getUsers(params),
  })

  constructor() {
    makeAutoObservable(this)
  }
}

export const store = new UsersPageStore()
