import { uniqueId, times } from "lodash"
import { faker } from "@faker-js/faker"

import { IProduct } from "./Products/Products.types"
import { IUser } from "./Users/Users.types"

export type TSortBy = "id" | "name"

export interface IApiParams {
  id?: string
  name?: string
  sortBy?: TSortBy
  sortAscending?: boolean
  page?: number
  pageSize?: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockProduct = (index: number): IProduct => {
  const adjective = faker.word.adjective()
  const adjectiveOther = faker.word.adjective()
  const name = faker.commerce.product()

  return {
    id: Number(uniqueId()),
    name: `${adjective} ${adjectiveOther} ${name}`,
  }
}

const mockUser = (index: number): IUser => ({
  id: uniqueId(),
  name: faker.name.fullName(),
})

const isFuzzyMatch = (a?: string | number, b?: string | number) =>
  String(a)
    ?.toLowerCase()
    .includes(String(b)?.toLowerCase() || "")

const buildResponse = <T extends IAnyObject>(
  { sortBy, sortAscending, page, pageSize, ...filters }: IApiParams,
  table: T[]
) => {
  let data = [...table]
  let totalCount = 1000

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

  return { data, totalCount }
}

class FakeApi {
  products = times(1000).map(mockProduct)
  users = times(1000).map(mockUser)

  getProducts = async (params: IApiParams) => {
    console.log({ params })
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
