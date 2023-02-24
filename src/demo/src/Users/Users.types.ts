import { TOrderDirection } from "../App.types"

export interface IUser {
  id: string
  name: string
}

const USERS_ORDER_BY = ["id", "name"] as const

export type TUsersOrderBy = typeof USERS_ORDER_BY[number]

export interface IUsersCollectionGenerics {
  id: string
  data: IUser
  filters: {}
  orderBy: TUsersOrderBy
  orderDirection: TOrderDirection
  pagination: IAnyObject
}
