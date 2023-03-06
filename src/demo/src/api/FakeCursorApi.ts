import { times } from "lodash"

import type { IProduct } from "../Products/Products.types"
import type { IUser } from "../Users/Users.types"

import type { IApiParamsCursor } from "./FakeApi.types"
import { isFuzzyMatch, mockProduct, mockUser, sleep } from "./FakeApi.utils"

const TOTAL_COUNT = 10

const buildResponse = <T extends IObjectWithId>(
  { sortBy, sortAscending, pageCursor, pageSize = 20, ...filters }: IApiParamsCursor,
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

  let nextPageCursor: string | undefined
  let prevPageCursor: string | undefined

  if (!pageCursor) {
    data = [...data.slice(0, pageSize)]

    const nextItem = table[pageSize]
    if (nextItem) {
      nextPageCursor = nextItem.id
    }

    return { data, nextPageCursor, prevPageCursor }
  }

  const indexFrom = table.findIndex((item) => item.id === pageCursor)
  data = [...data.slice(indexFrom, indexFrom + pageSize)]

  const nextItem = table[indexFrom + pageSize]
  if (nextItem) {
    nextPageCursor = nextItem.id
  }

  const prevPageItem = table[indexFrom - pageSize]
  if (prevPageItem) {
    prevPageCursor = prevPageItem.id
  }

  return { data, nextPageCursor, prevPageCursor }
}

export class FakeCursorApi {
  products = times(TOTAL_COUNT).map(mockProduct)
  users = times(TOTAL_COUNT).map(mockUser)

  getProducts = async (params: IApiParamsCursor) => {
    try {
      await sleep(250)
      return buildResponse<IProduct>(params, this.products)
    } catch (err) {
      console.log("err", err)
      return { data: [], nextPageCursor: undefined, prevPageCursor: undefined }
    }
  }

  getUsers = async (params: IApiParamsCursor) => {
    try {
      await sleep(250)
      return buildResponse<IUser>(params, this.users)
    } catch (err) {
      console.log("err", err)
      return { data: [], nextPageCursor: undefined, prevPageCursor: undefined }
    }
  }
}

export const cursorApi = new FakeCursorApi()
