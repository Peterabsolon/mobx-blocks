import { CursorPagination } from "../CursorPagination"
import { Collection } from "./Collection"

interface IUser {
  id: string
  foo: string
}

const users = new Collection({
  fetchFn: () => {
    return Promise.resolve({
      data: [] as IUser[],
      nextPageCursor: "123",
    })
  },
  initialFilters: { qux: "qux" },
  pagination: CursorPagination,
})

users.fetch({})
