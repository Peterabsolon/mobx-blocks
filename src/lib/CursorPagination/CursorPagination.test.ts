import { CursorPagination } from "./CursorPagination"

describe("CursorPagination", () => {
  it("can fetch more initially", () => {
    const pagination = new CursorPagination({ onChange: console.log })
    expect(pagination.canGoToNext).toBe(true)
  })

  it("sets current token", () => {
    const pagination = new CursorPagination({ onChange: console.log })
    pagination.setCurrent("someToken")
    expect(pagination.current).toBe("someToken")
    expect(pagination.next).toBe(null)
  })
})
