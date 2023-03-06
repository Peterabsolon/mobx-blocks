import { times } from "lodash"

import type { IProduct } from "../Products/Products.types"
import type { IUser } from "../Users/Users.types"

import type { IApiParams } from "./FakeApi.types"
import { isFuzzyMatch, mockProduct, mockUser, sleep } from "./FakeApi.utils"

const TOTAL_COUNT = 10

const buildResponse = <T extends IAnyObject>(
  { sortBy, sortAscending, page, pageSize, ...filters }: IApiParams,
  table: T[]
) => {
  let data = [...table]

  // Filter
  Object.entries(filters).forEach(([key, value]) => {
    data = data.filter((row) => isFuzzyMatch(row[key], value as string))
  })

  // Sort
  if (sortBy && typeof sortAscending !== "undefined") {
    data = data.sort((a, z) => {
      const first = sortAscending ? a : z
      const last = sortAscending ? z : a

      // If both are numbers, compare values
      if (typeof first[sortBy] === "number" && typeof last[sortBy] === "number") {
        return first[sortBy] - last[sortBy]
      }

      // Else compare by casting to string
      return String(first[sortBy]).localeCompare(String(last[sortBy]))
    })
  }

  // Paginate
  if (typeof page !== "undefined" && pageSize) {
    const from = (page - 1) * pageSize
    const to = page * pageSize

    data = data.slice(from, to)
  }

  return { data, totalCount: TOTAL_COUNT }
}

class FakeApi {
  products = times(TOTAL_COUNT).map(mockProduct)
  users = times(TOTAL_COUNT).map(mockUser)

  getProducts = async (params: IApiParams) => {
    try {
      await sleep(250)
      return buildResponse<IProduct>(params, this.products)
    } catch (err) {
      console.log("err", err)
      return { data: [], totalCount: 0 }
    }
  }

  getUsers = async (params: IApiParams) => {
    try {
      await sleep(250)
      return buildResponse<IUser>(params, this.users)
    } catch (err) {
      console.log("err", err)
      return { data: [], totalCount: 0 }
    }
  }
}

export const api = new FakeApi()
