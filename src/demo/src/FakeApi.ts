import { uniqueId, times } from "lodash"
import { faker } from "@faker-js/faker"

import { IProduct } from "./Products/Products.types"
import { IUser } from "./Users/Users.types"
import { TOrderDirection } from "./App.types"

interface IParams {
  orderBy?: string
  orderDirection?: TOrderDirection
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
  { orderBy, orderDirection, page, pageSize, ...filters }: IParams,
  table: T[]
) => {
  let data = table
  let totalCount = 1000

  // Filter
  Object.entries(filters).forEach(([key, value]) => {
    data = data.filter((row) => isFuzzyMatch(row[key], value as string))
  })

  // Sort
  if (orderBy && orderDirection) {
    data = data.sort((a, z) => {
      const isAsc = orderDirection === "ASCENDING"

      const first = isAsc ? a : z
      const last = isAsc ? z : a

      // If both are numbers, compare values
      if (typeof first[orderBy] === "number" && typeof last[orderBy] === "number") {
        return first[orderBy] - last[orderBy]
      }

      // Else compare by cassting to string
      return String(first[orderBy]).localeCompare(String(last[orderBy]))
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

  getProducts = async (params: IParams) => {
    try {
      await sleep(250)
      return buildResponse<IProduct>(params, this.products)
    } catch (err) {
      console.log("err", err)
      return { data: [], totalCount: 0 }
    }
  }

  getUsers = async (params: IParams) => {
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
