import { CursorPagination } from "./CursorPagination"

describe("CursorPagination", () => {
  it("can fetch more initially", () => {
    const pagination = new CursorPagination({ onChange: console.log })
    expect(pagination.hasMore).toBe(true)
  })

  it("sets thisPageToken on init call", () => {
    const pagination = new CursorPagination({ onChange: console.log })
    pagination.init("someToken")
    expect(pagination.current).toBe("someToken")
    expect(pagination.next).toBe(undefined)
  })
})
